import pandas as pd
import numpy as np
import json
from pathlib import Path
from transformers import DistilBertTokenizer, DistilBertModel
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
import torch
import joblib
from tqdm import tqdm

class EventSectorImpactTrainer:
    def __init__(self, json_path, model_dir="saved_models", cache_file="embeddings_cache.npy"):
        self.json_path = json_path
        self.model_dir = Path(model_dir or Path(__file__).resolve().parent / "saved_models")
        self.cache_file = Path(cache_file)
        self.models = {}
        self.event_impact_model = None
        self.sectors = [
            'communication_services', 'consumer_discretionary', 'consumer_staples',
            'energy', 'financials', 'health_care', 'industrials',
            'information_technology', 'materials', 'real_estate', 'utilities'
        ]

        # Initialize DistilBERT tokenizer and model
        self.tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
        self.bert_model = DistilBertModel.from_pretrained('distilbert-base-uncased')
        self.bert_model.eval()

        # Create model directory if it doesn't exist
        self.model_dir.mkdir(exist_ok=True)

    def bert_embedding(self, texts, batch_size=32):
        """
        Generate BERT embeddings for a list of texts in batches.
        Use a cache to avoid regenerating embeddings for the same texts.
        """
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

            # Use mean pooling of last hidden states
            batch_embeddings = outputs.last_hidden_state.mean(dim=1).cpu().numpy()
            embeddings.append(batch_embeddings)

        # Vertically stack all batch embeddings into a single array
        return np.vstack(embeddings)

    def load_and_preprocess(self):
        """
        Load and preprocess data from the JSON file.
        """
        # Read the JSON file
        with open(self.json_path, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)

        records = []
        # Loop through the months and extract data
        for month, data in raw_data.items():
            if isinstance(data, dict):
                if 'events' in data:
                    # Fetch events and setor data
                    events = data['events']
                    sector_data = {key: value for key, value in data.items() if key in self.sectors} # Load sectors that the models are trained for
                else:
                    events = []
                    sector_data = {k: v for k, v in data.items() if k in self.sectors} # Load sectors that the models are trained for
            else:
                events = []
                sector_data = {}

            record = {'events': ' '.join(events) if isinstance(events, list) else str(events)} # combine events into a single string
            record.update(sector_data)
            records.append(record)

        self.df = pd.DataFrame(records)
        return self.df

    def train_sector_models(self):
        """
        Train one model per sector using precomputed embeddings.
        """
        if 'events' not in self.df.columns:
            raise ValueError("No event data found in training data")

        print("Generating BERT embeddings...")
        X = self.bert_embedding(self.df['events'].tolist())

        print("Training sector models...")
        # Loop through each sector and train a regression model
        for sector in tqdm(self.sectors, desc="Training sector models"):
            if sector in self.df.columns:
                y = self.df[sector].values

                # Using Sci-kit-learn's RandomForestRegressor for regression
                model = Pipeline([
                    ('regressor', RandomForestRegressor(
                        n_estimators=100,
                        max_depth=5,
                        random_state=42,
                        n_jobs=-1
                    ))
                ])

                model.fit(X, y)
                # Aggregate all models
                self.models[sector] = model

                # Save the model
                joblib.dump(model, self.model_dir / f"{sector}_model.joblib")
            else:
                print(f"Warning: No training data for sector {sector}")
                self.models[sector] = None

    def train_event_impact_model(self):
        """
        Train a model to predict the impact of individual events.
        """
        print("Calculating event impacts...")
        # Get embeddings for all events
        embeddings = self.bert_embedding(self.df['events'].tolist())
        impacts = []
        # For each embedding, calculate the impact on the sector models
        for i in range(len(embeddings)):
            event_embedding = embeddings[i]

            # Get the average embedding of all other events to get a context
            other_embeddings = np.delete(embeddings, i, axis=0)
            avg_other_embedding = other_embeddings.mean(axis=0)

            total_impact = 0
            valid_models = 0

            for sector, model in self.models.items():
                if model is not None:
                    try:
                        # Find predictions on all modelsfor the event and other events to see how impactful each event is
                        full_pred = model.predict(event_embedding.reshape(1, -1))[0]
                        other_pred = model.predict(avg_other_embedding.reshape(1, -1))[0]
                        # The impact is the difference between the full prediction and the average prediction, to show how 1 event can impact all predictions
                        total_impact += abs(full_pred - other_pred)
                        valid_models += 1
                    except:
                        continue

            if valid_models > 0:
                # Get the average impact across all models
                avg_impact = total_impact / valid_models
                impacts.append(avg_impact)
            else:
                impacts.append(0.0)

        # Training the event impact model using scikit-learn's RandomForestRegressor
        print("Training event impact model...")
        self.event_impact_model = Pipeline([
            ('regressor', RandomForestRegressor(
                n_estimators=100,
                max_depth=5,
                random_state=42,
                n_jobs=-1
            ))
        ])
        self.event_impact_model.fit(embeddings, impacts)

        # Save the event impact model
        joblib.dump(self.event_impact_model, self.model_dir / "event_impact_model.joblib")

    def train(self):
        """
        Train sector models and the event impact model.
        """
        print("Loading and preprocessing data...")
        self.load_and_preprocess()

        # Train sector models
        self.train_sector_models()

        # Train event impact model
        self.train_event_impact_model()

if __name__ == "__main__":
    # Initialize the trainer with the JSON file
    trainer = EventSectorImpactTrainer(
        json_path="../data/articles/gdelt_headlines_cleaned_0.json",
        model_dir="saved_models",
        cache_file="embeddings_cache.npy"
    )

    # Train models
    trainer.train()