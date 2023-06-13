import pandas as pd
import json
from itertools import combinations

# Load the dataset
df = pd.read_csv('scrubbed.csv')
df = df[df['country'] == 'us'].dropna()
df['datetime'] = pd.to_datetime(df['datetime'], errors='coerce')

# Extract year and month
df['year'] = df['datetime'].dt.year
df['month'] = df['datetime'].dt.month

# Filter necessary fields
df = df[['state', 'shape', 'year', 'month', 'latitude', 'longitude', 'comments']]

# Group the data by state, shape, and year
grouped = df.groupby(['state', 'shape', 'year'])

# Create the nodes and edges
nodes = []
edges = []

for name, group in grouped:
    for index in group.index:
        node = {
            'id': index,
            'details': name,
            'latitude': group.loc[index, 'latitude'],
            'longitude': group.loc[index, 'longitude'],
            'year': group.loc[index, 'year']
        }
        nodes.append(node)
    for pair in combinations(group.index, 2):
        print(pair)
        edges.append({'source': pair[0], 'target': pair[1]})

# Save nodes and edges to json for use with D3.js
nodes_df = pd.DataFrame(nodes)
edges_df = pd.DataFrame(edges)
nodes_df.to_json('nodes.json', orient='records')
edges_df.to_json('links.json', orient='records')
