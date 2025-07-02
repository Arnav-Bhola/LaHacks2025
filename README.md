# Crash Guard: An All-in-One Portfolio Risk-Management Tool

## Inspiration
As a stock market enthusiast, I have always heard stories about someone losing everything in the stock market overnight. While these dramatic losses are rare, a study conducted in UC Berkeley by Brad M. Barber, Yi-Tsung Lee, Yu-Jane Liu, and Terrance Odean concluded that individual investors make up 90% of the market, and they lose "Too Much!" due to a lack of guidance and knowledge.

In fact, it breaks my heart to hear that several young investors like myself buy holdings in the market and turn away after failing to make a profit. “Nobody — I don’t care if you’re Warren Buffett or Jimmy Buffett — nobody knows if a stock will go up, down, sideways, or in fucking circles.” - Mark Graham, Wolf of Wall Street. 

To mitigate risk from the unpredictability of the stock market, my goal was to build a platform that analyzes current real-life events, combined with traditional market strategies to improve the user's financial literacy and hopefully save them from losing money.

## What it Does
Crash Guard allows the user to run analysis on a manually entered or ai-generated portfolio. The analysis consists of the following features:

- Predictions on financial sectors from the latest real life events taken from gdelt via custom-made fine-tuned NLP regressor Model.
- Catches most impactful events to look out for, and generates reasoning to why they can impact the market.
- AI-Generated Market Strategy / Recommendations moving forward
- A Histogram to visually represent the spread of different financial sectors and the focus of current real-life events.

Crash Guard also has an integrated financial agent chatbox which takes the user's financial query and finds the optimal agent from Fetch AI's agentverse marketplace to respond with.

With a sleek UI and easy navigation, Crash Guard hopes to allow every beginner investor to understand investing and create a powerful portfolio.

## How I Built It

I started off by training my NLP regressor model to generate predictors for financial sector trends. I got the data from scraping the [gdelt masterfile](http://data.gdeltproject.org/gdeltv2/masterfilelist.txt) and historical trends of the [S&P 500 financial sector indexes](https://www.spglobal.com/spdji/en/index-family/equity/us-equity/sp-sectors/)

Once my NLP model was tuned and ready to go, I initialized my backend and frontend, connecting everything. The frontend is created by [Next.JS](https://nextjs.org/) using [Typescript](https://www.typescriptlang.org/) built on the [React](https://react.dev/) Framework and styled using [tailwind](https://tailwindcss.com/). 

Moving forward, I integrated the reasoning and explanation features using [FetchAI](https://fetch.ai)'s ASI-One Mini Model. It was used to find optimal agents from agentverse, which were run to complete the rest of the analysis. Shallow analysis was done by accessing the chat completion endpoint. 

## What's Missing?
I'm really proud of the level of analysis that Crash Guard offers, however there are many things that I couldn't implement due to difficulty and the time crunch. 
- Monte Carlo Simulations
- Backtesting strategies
- Optimization for faster responses
- Scraping more data for more accurate results
With additional resources and time, Crash Guard can be a transformative app that leads us to the next step in financial understanding and literacy.

## What I learned
Before going into Crash Guard, I had no idea what the AI agents were responsible for. By exploring the Fetch AI docs and other examples, I discovered their limitless possibilities. Not only did this interest me, but it also fueled me to use the agents in my project. By integrating this completely different technology, I learned a lot more about chat protocols, agnet-to-agent comunication, and Fetch AI.

## Steps to Run Locally

1. Clone the project

2. Go to the project directory

3. Install all frontend and backend dependencies

4. Start the frontend and backend servers
