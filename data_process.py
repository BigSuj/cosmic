import pandas as pd

# Load your data
df = pd.read_csv('scrubbed.csv')
df = df[df['country'] == 'us']

# Handle the '24:00' time issue
df['datetime'] = df['datetime'].replace({'24:00': '00:00'}, regex=True)

# Convert the 'datetime' column to datetime format
df['datetime'] = pd.to_datetime(df['datetime'], format='%m/%d/%Y %H:%M', errors='coerce')

df = df[['datetime', 'latitude', 'longitude']]
df['year'] = df['datetime'].dt.year

df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')
df = df.dropna()
df_grouped = df.groupby(['latitude', 'longitude', 'year']).count().reset_index().reset_index()


df_grouped.to_csv('processed_data.csv', index=False)

