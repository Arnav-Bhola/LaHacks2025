from fetchai import fetch
import requests
import json
from pydantic import BaseModel, Field
from langchain.output_parsers import PydanticOutputParser
import time
import os

API_KEY = "sk_eef4031c1ba2484d9803935a1500a0d0c22e468c70e642aaab2d82f9604bf594"

class AgentRecommendation(BaseModel):
    reasoning: str = Field(description="Reasoning for selecting this AI agent")
    recommended_ai_number: int = Field(description="The number of the AI agent recommended (just the number)")

class GeneratedPortfolio(BaseModel):
    holdings: list[dict] = Field(description="List of stock tickers and quantities")

agent_parser = PydanticOutputParser(pydantic_object=AgentRecommendation)
portfolio_parser = PydanticOutputParser(pydantic_object=GeneratedPortfolio)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Step 1: Fetch available AIs
scenario = "I need to generate a portfolio as per a user prompt"
available_ais = fetch.ai(scenario)

ai_descriptions = ""
for i, ai in enumerate(available_ais['ais']):
    ai_descriptions += f"AI #{i+1}: {ai['name']}\n"
    ai_descriptions += f"Description: {ai.get('description', 'No description available')}\n"
    ai_descriptions += f"Address: {ai['address']}\n"
    ai_descriptions += f"Category: {ai.get('category', 'No category available')}\n\n"

# Step 2: Find the best agent
prompt = f"""
Here are several AI agents available:

{ai_descriptions}

Given the following scenario, which AI agent would be the most appropriate to use and why?

Scenario: {scenario}

{agent_parser.get_format_instructions()}
"""

url = "https://api.asi1.ai/v1/chat/completions"

payload = json.dumps({
    "model": "asi1-mini",
    "messages": [
        {
            "role": "user",
            "content": prompt
        }
    ],
    "temperature": 0,
    "stream": False,
    "max_tokens": 500
})

headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': f'Bearer {API_KEY}'
}

max_retries = 3
retry_count = 0
valid_response = False

while retry_count < max_retries and not valid_response:
    response = requests.request("POST", url, headers=headers, data=payload)

    print("\nLLM's Response:")
    print("-" * 50)
    try:
        result = json.loads(response.text)
        if 'choices' in result and len(result['choices']) > 0:
            llm_response = result['choices'][0]['message']['content']
            print(llm_response)
            
            try:
                parsed_output = agent_parser.parse(llm_response)
                
                ai_index = parsed_output.recommended_ai_number - 1
                
                if 0 <= ai_index < len(available_ais['ais']):
                    recommended_ai = available_ais['ais'][ai_index]
                    print("\nRecommended Agent Details:")
                    print("-" * 50)
                    print(f"Name: {recommended_ai['name']}")
                    print(f"Address: {recommended_ai['address']}")
                    print(f"Reasoning: {parsed_output.reasoning}")
                    
                    # Step 3: Use the recommended AI to generate the portfolio
                    try:
                        # Read the portfolio prompt from portfolio_prompt.txt
                        portfolio_prompt_path = os.path.join(BASE_DIR, "portfolio_prompt.txt")
                        with open(portfolio_prompt_path, "r") as file:
                            portfolio_prompt_content = file.read().strip()
                            print(portfolio_prompt_content)

                        portfolio_prompt = f"""
                        Use the following agent to generate a portfolio:
                        Name: {recommended_ai['name']}
                        Address: {recommended_ai['address']}
                        Prompt: {portfolio_prompt_content}

                        Please provide the portfolio in the following JSON format example:
                        {{
                            "holdings": [
                                {{
                                    "ticker": "AAPL",
                                    "quantity": 10
                                }},
                                {{
                                    "ticker": "MSFT",
                                    "quantity": 15
                                }}
                            ]
                        }}

                        {portfolio_parser.get_format_instructions()}
                        """

                        portfolio_payload = json.dumps({
                            "model": "asi1-mini",
                            "messages": [
                                {
                                    "role": "user",
                                    "content": portfolio_prompt
                                }
                            ],
                            "temperature": 0,
                            "stream": False,
                            "max_tokens": 800
                        })

                        portfolio_response = requests.request("POST", url, headers=headers, data=portfolio_payload)
                        portfolio_result = json.loads(portfolio_response.text)

                        if 'choices' in portfolio_result and len(portfolio_result['choices']) > 0:
                            portfolio_llm_response = portfolio_result['choices'][0]['message']['content']
                            print("\nPortfolio Response:")
                            print("-" * 50)
                            print(portfolio_llm_response)

                            try:
                                parsed_portfolio = portfolio_parser.parse(portfolio_llm_response)
                                print("\nGenerated Portfolio:")
                                print("-" * 50)
                                for holding in parsed_portfolio.holdings:
                                    print(f"Ticker: {holding['ticker']}, Quantity: {holding['quantity']}")

                                # Step 4: Save the portfolio to a JSON file
                                portfolio_json_path = os.path.join(BASE_DIR, "generated_portfolio.json")
                                with open(portfolio_json_path, "w", encoding="utf-8") as json_file:
                                    json.dump(parsed_portfolio.dict(), json_file, indent=2)
                                print(f"\nPortfolio saved to {portfolio_json_path}")

                                valid_response = True
                            except Exception as e:
                                print(f"Failed to parse portfolio response: {e}")
                                retry_count += 1
                                if retry_count < max_retries:
                                    print(f"Retrying... (Attempt {retry_count + 1}/{max_retries})")
                                    time.sleep(1)
                        else:
                            print("No valid portfolio received.")
                            retry_count += 1
                            if retry_count < max_retries:
                                print(f"Retrying... (Attempt {retry_count + 1}/{max_retries})")
                                time.sleep(1)
                    except FileNotFoundError:
                        print(f"Error: 'portfolio_prompt.txt' file not found in {BASE_DIR}.")
                        break
                else:
                    print(f"Error: Invalid AI number {parsed_output.recommended_ai_number}")
                    retry_count += 1
                    if retry_count < max_retries:
                        print(f"Retrying... (Attempt {retry_count + 1}/{max_retries})")
            except Exception as e:
                print(f"Failed to parse response with LangChain parser: {e}")
                retry_count += 1
                if retry_count < max_retries:
                    print(f"Retrying... (Attempt {retry_count + 1}/{max_retries})")
                    time.sleep(1)
        else:
            print("No recommendation received.")
            print("Raw response:", response.text)
            retry_count += 1
            if retry_count < max_retries:
                print(f"Retrying... (Attempt {retry_count + 1}/{max_retries})")
                time.sleep(1)
    except json.JSONDecodeError:
        print("Failed to parse response as JSON.")
        print("Raw response:", response.text)
        retry_count += 1
        if retry_count < max_retries:
            print(f"Retrying... (Attempt {retry_count + 1}/{max_retries})")
            time.sleep(1)

if not valid_response:
    print("\nFailed to get a valid portfolio after all retry attempts.")