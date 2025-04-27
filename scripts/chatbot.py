from fetchai import fetch
import requests
import json
from pydantic import BaseModel, Field
from langchain.output_parsers import PydanticOutputParser
import sys
import time
import os

API_KEY = "sk_ae9b780415204cf6be1528f8007a9cc83c2bdebf1784464abbd023951727a41e"

class AgentRecommendation(BaseModel):
    reasoning: str = Field(description="Reasoning for selecting this AI agent")
    recommended_ai_number: int = Field(description="The number of the AI agent recommended (just the number)")

parser = PydanticOutputParser(pydantic_object=AgentRecommendation)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def get_final_content(scenario):
    available_ais = fetch.ai(scenario)

    ai_descriptions = ""
    for i, ai in enumerate(available_ais['ais']):
        ai_descriptions += f"AI #{i+1}: {ai['name']}\n"
        ai_descriptions += f"Description: {ai.get('description', 'No description available')}\n"
        ai_descriptions += f"Address: {ai['address']}\n"
        ai_descriptions += f"Category: {ai.get('category', 'No category available')}\n\n"

    prompt = f"""
    Here are several AI agents available:

    {ai_descriptions}

    Given the following prompt, which AI agent would be the most appropriate to call and why?

    prompt: {scenario}

    {parser.get_format_instructions()}
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

        try:
            result = json.loads(response.text)
            if 'choices' in result and len(result['choices']) > 0:
                llm_response = result['choices'][0]['message']['content']
                
                try:
                    parsed_output = parser.parse(llm_response)
                    
                    ai_index = parsed_output.recommended_ai_number - 1
                    
                    if 0 <= ai_index < len(available_ais['ais']):
                        recommended_ai = available_ais['ais'][ai_index]
                        valid_response = True

                        follow_up_prompt = f"""
                        Please engage with the following agent and provide their response to the prompt, only provide the response from the agent, nothing more nothing less:

                        Name: {recommended_ai['name']}
                        Address: {recommended_ai['address']}
                        Prompt: {scenario}
                        """
                        follow_up_payload = json.dumps({
                            "model": "asi1-mini",
                            "messages": [
                                {
                                    "role": "user",
                                    "content": follow_up_prompt
                                }
                            ],
                            "temperature": 0,
                            "stream": False,
                            "max_tokens": 500
                        })

                        follow_up_response = requests.request("POST", url, headers=headers, data=follow_up_payload)
                        follow_up_result = json.loads(follow_up_response.text)
                        agent_response = follow_up_result["choices"][0]["message"]["content"]

                        return agent_response

                    else:
                        retry_count += 1
                        if retry_count < max_retries:
                            time.sleep(1)
                except Exception as e:
                    retry_count += 1
                    if retry_count < max_retries:
                        time.sleep(1)
            else:
                retry_count += 1
                if retry_count < max_retries:
                    time.sleep(1)
        except json.JSONDecodeError:
            retry_count += 1
            if retry_count < max_retries:
                time.sleep(1)

    if not valid_response:
        return "Failed to get a valid agent recommendation after all retry attempts."

if __name__ == "__main__":
    try:
        # Use absolute paths for prompt.txt and answer_prompt.txt
        prompt_file_path = os.path.join(BASE_DIR, "prompt.txt")
        answer_file_path = os.path.join(BASE_DIR, "answer_prompt.txt")

        with open(prompt_file_path, "r") as file:
            scenario = file.read().strip()  # Read the scenario from the text file
    except FileNotFoundError:
        print(f"Error: '{prompt_file_path}' file not found.")
        sys.exit(1)

    final_content = get_final_content(scenario)

    # If the final content is in JSON format, extract the "response" field
    try:
        final_content_json = json.loads(final_content)
        plain_text_response = final_content_json.get("response", "No response found.")
    except json.JSONDecodeError:
        plain_text_response = final_content  # If not JSON, use the raw content

    # Save the plain text response to answer_prompt.txt
    with open(answer_file_path, "w", encoding="utf-8") as output_file:
        output_file.write(plain_text_response)

    print(f"The response has been saved to '{answer_file_path}'.")