import json
import numpy as np
import pandas as pd
from pathlib import Path
from transformers import DistilBertTokenizer, DistilBertModel
import torch
import joblib
from tqdm import tqdm
import subprocess
import sys
import traceback

def main():
    try:
        print("Python script started!", flush=True)
        
        # Initialize with correct relative paths
        script_dir = Path(__file__).parent.resolve() # Using Path for cross-functionality

        # Initialize the predictor with the directory containing cached embeddings and models
        predictor = EventSectorImpactPredictor(
            model_dir=script_dir / "saved_models",
            cache_file=script_dir / "embeddings_cache.npy"
        )

        # Load news headlines from the CSV file
        csv_path = script_dir / '../data/articles/all_titles_99_deduplicated.csv'
        if not csv_path.exists():
            raise FileNotFoundError(f"CSV file not found at: {csv_path}")  # Ensure the file exists

        current_events = predictor.load_events_from_csv(csv_path)
        print(f"Loaded {len(current_events)} events for analysis", flush=True)

        # Predict impacts 
        results = predictor.predict_impact(current_events)
        print("Analysis completed successfully", flush=True)
    except Exception as e:
        print(f"Error in Python script: {str(e)}", flush=True)
        traceback.print_exc(file=sys.stdout)
        sys.exit(1)

class EventSectorImpactPredictor:
    def __init__(self, model_dir="../scripts/saved_models", cache_file="../scripts/embeddings_cache.npy"):
        """
        Initialize the predictor with models and embeddings.
        """
        self.model_dir = Path(model_dir or Path(__file__).resolve().parent / "saved_models")
        self.cache_file = Path(cache_file or Path(__file__).resolve().parent / "embeeddings_cache.npy")
        self.models = {}
        self.event_impact_model = None
        self.sectors = [
            'communication_services', 'consumer_discretionary', 'consumer_staples',
            'energy', 'financials', 'health_care', 'industrials',
            'information_technology', 'materials', 'real_estate', 'utilities'
        ]

        # Ensure models and embedding cache exists, otherwise run trainer.py to create them
        self.ensure_models_and_cache()

        # Initialize DistilBERT tokenizer and model
        self.tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
        self.bert_model = DistilBertModel.from_pretrained('distilbert-base-uncased')
        self.bert_model.eval()  # Put in evaluation mode

        # Load models
        self.load_models()

        # Load embeddings cache
        self.embeddings_cache = self.load_embedding_cache()

    def ensure_models_and_cache(self):
        """
        Ensure that the models and embedding cache exist. If not, runs trainer.py.
        """
        # Check if the sector models and event impact model exist
        required_models = [self.model_dir / f"{sector}_model.joblib" for sector in self.sectors]
        required_models.append(self.model_dir / "event_impact_model.joblib")
        models_missing = not all(model.exists() for model in required_models)

        # Check if the embedding cache exists
        cache_missing = not self.cache_file.exists()

        # If any models or cache are missing, run the trainer script to generate them
        if models_missing or cache_missing:
            print("Models or embedding cache not found. Running trainer.py to generate them...")
            trainer_script_path = Path(__file__).resolve().parent / "trainer.py"
            result = subprocess.run(["python", str(trainer_script_path)], capture_output=True, text=True)

            if result.returncode != 0:
                print(f"Error running trainer.py: {result.stderr}")
                raise RuntimeError("Failed to generate models or embedding cache.")
            else:
                print(f"Trainer.py output:\n{result.stdout}")

    def load_models(self):
        """
        Load trained models for each sector and the event impact model from the model directory.
        """
        # Load models for each sector
        for sector in self.sectors:
            model_path = self.model_dir / f"{sector}_model.joblib"
            if model_path.exists():
                self.models[sector] = joblib.load(model_path)
            else:
                print(f"Warning: Model for sector '{sector}' not found. Predictions for this sector will be 0.")
                self.models[sector] = None

        # Load the event impact model
        event_impact_model_path = self.model_dir / "event_impact_model.joblib"
        if event_impact_model_path.exists():
            self.event_impact_model = joblib.load(event_impact_model_path)
        else:
            print("Warning: Event impact model not found. Event impacts will not be calculated.")

    def load_embedding_cache(self):
        """
        Load the embedding cache from a file, or initialize an empty cache.
        """
        if self.cache_file.exists():
            print(f"Loading embeddings from cache: {self.cache_file}")
            return np.load(self.cache_file)
        else:
            print("No embeddings cache found. Generating embeddings from scratch.")
            return None

    def bert_embedding(self, texts, batch_size=32):
        """
        Generate BERT embeddings for a list of texts in batches.
        Use the cache if available.
        """
        # If cache exists, use that.
        if self.embeddings_cache is not None:
            print("Using precomputed embeddings from cache.")
            return self.embeddings_cache

        embeddings = []

        # Loop through texts in batches
        for i in tqdm(range(0, len(texts), batch_size), desc="Generating embeddings"):  # Progress bar
            # Get the next batch of texts
            batch = texts[i:i+batch_size]

            # Tokenize the batch using the DistilBERT tokenizer
            inputs = self.tokenizer(
                batch,
                padding=True,
                truncation=True,
                max_length=128,
                return_tensors="pt"
            )

            # Run the batch through the DistilBERT model without gradients
            with torch.no_grad():
                outputs = self.bert_model(**inputs)

            # Use mean pooling of generated output, then move to CPU and convert to numpy array
            batch_embeddings = outputs.last_hidden_state.mean(dim=1).cpu().numpy()
            embeddings.append(batch_embeddings)  # Append the batch embeddings

        # Vertically stack all batch embeddings into a single array
        embeddings = np.vstack(embeddings)

        # Save embeddings to cache for future use
        print(f"Saving embeddings to cache: {self.cache_file}")
        np.save(self.cache_file, embeddings)

        return embeddings

    def predict_event_impacts(self, events):
        """
        Predict the impact of each event using the pre-trained event impact model.
        """
        # Ensure that the event impact model is loaded
        if self.event_impact_model is None:
            raise ValueError("Event impact model is not loaded. Cannot calculate event impacts.")

        # Generate embeddings for the events
        embeddings = self.bert_embedding(events)

        # Predict impacts for each event
        impacts = self.event_impact_model.predict(embeddings)

        # Return a list of events with their predicted impacts
        return [
            {"event": event, "impact": round(float(impact), 4)}
            for event, impact in zip(events, impacts)  # Zip events with their impacts
        ]

    def predict_impact(self, events, save_results=True):
        """
        Predicts sector impacts from current events and save results to result.json.
        """
        # Make sure events is a list
        if not isinstance(events, list):
            events = [str(events)]

        # Generate embeddings for all events together
        X = self.bert_embedding(events)

        predictions = {}
        for sector, model in self.models.items():
            if model is not None:  # Verify is model exists
                try:
                    # Run the model to create a prediction from the BERT embeddings
                    predictions[sector] = float(model.predict(X.mean(axis=0, keepdims=True))[0]) 
                except:
                    # If prediction fails, set to 0.0 to avoid unexpected app failures
                    predictions[sector] = 0.0
            else:
                # If prediction fails, set to 0.0 to avoid unexpected app failures
                predictions[sector] = 0.0

        # Get the events sorted by their impact.
        top_events = self.predict_event_impacts(events)

        # Sort the sectors based on their impact
        sorted_sectors = sorted(predictions.items(), key=lambda x: x[1], reverse=True)

        results = {
            "sector_with_most_growth_potential": sorted_sectors[0][0],
            "sector_with_least_growth_potential": sorted_sectors[-1][0],
            "growing_sectors": [sector for sector, val in predictions.items() if val > 0.05],  # Increase of 5%
            "declining_sectors": [s for s, val in predictions.items() if val <= -0.05],  # Decrease of 5%
            "top_5_events": top_events[:5],
            "all_predictions": {key: round(value, 4) for key, value in predictions.items()} # Round all predictions to 4 decimal places
        }

        # Save results to JSON file if required
        if save_results:
            with open('../scripts/result.json', 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2)

        return results

    def load_events_from_csv(self, csv_path):
        """
        Load events from a CSV file using the 'Title' column.
        """
        df = pd.read_csv(csv_path)
        if 'Title' not in df.columns:
            raise ValueError("The CSV file doesn't contain a 'Title' column.")
        return df['Title'].dropna().tolist()
    
if __name__ == "__main__":
    main()