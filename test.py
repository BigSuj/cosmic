import pandas as pd

# Load your data
df = pd.read_csv('scrubbed.csv')
df = df[df['country'] == 'us']

# Handle the '24:00' time issue
df['datetime'] = df['datetime'].replace({'24:00': '00:00'}, regex=True)

# Convert the 'datetime' column to datetime format
df['datetime'] = pd.to_datetime(df['datetime'], format='%m/%d/%Y %H:%M', errors='coerce')