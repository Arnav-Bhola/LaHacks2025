import json
import os
import matplotlib.pyplot as plt
import sys

def generate_histogram(sector_predictions, output_path):
    # Prepare data
    sectors = list(sector_predictions.keys())
    values = list(sector_predictions.values())
    
    # Create figure to plot the histogram
    plt.figure(figsize=(10, 6))
    bars = plt.bar(
        sectors, 
        values, 
        color=["red" if value < 0 else "green" for value in values]  # Red for negative, green for positive
    )
    
    plt.title('Sector Impact from Latest Market News', fontsize=16, color='white')
    plt.xlabel('Sectors', fontsize=12, color='white')
    plt.ylabel('Impact (%)', fontsize=12, color='white')
    plt.xticks(rotation=45, ha='right', fontsize=10, color='white')
    plt.yticks(fontsize=10, color='white')
    plt.gca().set_facecolor('#202c3c')  # Set dark background
    plt.tight_layout()
    
    # Save figure to file
    plt.savefig(output_path, dpi=300, bbox_inches="tight", facecolor='#202c3c')
    plt.close()

if __name__ == "__main__":
    try:
        # Read sector_predictions from result.json
        script_dir = os.path.dirname(os.path.abspath(__file__))
        result_file_path = os.path.join(script_dir, "result.json")
        
        # Check if result.json exists
        if not os.path.exists(result_file_path):
            raise FileNotFoundError(f"result.json not found in {script_dir}")
        
        # Load the JSON data from rusult.json
        with open(result_file_path, "r") as file:
            result_data = json.load(file)
        
        # Extract all_predictions from result.json, check if it exists
        if "all_predictions" not in result_data:
            raise KeyError("'all_predictions' field is missing in result.json")
        
        sector_predictions = result_data["all_predictions"]
        
        # Define the output path for the histogram using the directory
        output_path = os.path.join(script_dir, "../frontend/public/images/sector_histogram.png")
        os.makedirs(os.path.dirname(output_path), exist_ok=True) # Ensure the directory exists
        
        # Generate the histogram
        generate_histogram(sector_predictions, output_path)
        print(f"Histogram generated successfully at {output_path}")
    except Exception as e:
        print(f"Error generating histogram: {str(e)}")
        sys.exit(1)