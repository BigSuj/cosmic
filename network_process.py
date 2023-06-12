import pandas as pd
import json
from itertools import combinations
from nltk.corpus import stopwords

# Load the dataset
df = pd.read_csv('scrubbed.csv')
df = df[df['country'] == 'us'].dropna()
df['datetime'] = pd.to_datetime(df['datetime'], errors='coerce')
duration = 'duration (seconds)'
df[duration] = df[duration].astype(float)
#df = df[df['duration (seconds)'] > 1000]

# Extract year and month
df['year'] = df['datetime'].dt.year
df['month'] = df['datetime'].dt.month

# Preprocess comments and generate bigrams
comments = df['comments'].tolist()

# Preprocessing function for generating bigrams
def preprocess_comments(comments, stopwords):
    desired_keywords = ['ufo', 'alien', 'extraterrestrial']  # Desired keywords or phrases related to the UFO
    stopwords_cust = ['event', 'took']
    word_counts = {}
    processed_bigrams = []
    for comment in comments:
        words = comment.lower().split()
        words = [word for word in words if word not in stopwords and word not in stopwords_cust and not word.isdigit()]  # Remove stopwords, select desired keywords, and exclude numbers
        for word in words:
            if word in word_counts:
                word_counts[word] += 1
            else:
                word_counts[word] = 1
        comment_bigrams = list(combinations(words, 2))
        processed_bigrams.extend(comment_bigrams)
    return processed_bigrams, word_counts

# Remove duplicate bigrams
def remove_duplicate_bigrams(bigrams_df):
    return bigrams_df.drop_duplicates()

# Remove bigrams with word counts less than 100
def remove_low_count_bigrams(bigrams_df, word_counts, threshold):
    return bigrams_df[(bigrams_df['word1'].map(word_counts) >= threshold) & (bigrams_df['word2'].map(word_counts) >= threshold)]

# Generate bigrams from comments using NLTK
stopwords_list = set(stopwords.words('english'))
bigrams_list, word_counts = preprocess_comments(comments, stopwords_list)

# Remove unwanted bigrams
unwanted_bigrams = [('of', 'the'), ('a', 'lot'), ('in', 'the')]  # Add any additional unwanted bigrams
bigrams_df = pd.DataFrame(bigrams_list, columns=['word1', 'word2'])
bigrams_df = remove_duplicate_bigrams(bigrams_df)

# Add count column to the words
bigrams_df['word1_count'] = bigrams_df['word1'].map(word_counts)
bigrams_df['word2_count'] = bigrams_df['word2'].map(word_counts)

# Remove bigrams with word counts less than 100
threshold = 2000
bigrams_df = remove_low_count_bigrams(bigrams_df, word_counts, threshold)

# Save bigrams to a JSON file
bigrams_df.to_json('bigrams.json', orient='records')
