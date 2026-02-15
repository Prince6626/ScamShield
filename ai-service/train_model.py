import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib
import os

# Dummy dataset
data = pd.read_csv("job_posts.csv")

df = pd.DataFrame(data)

# Split data
X = df['text']
y = df['label']

# Vectorization
vectorizer = TfidfVectorizer()
X_tfidf = vectorizer.fit_transform(X)

# Model Training
model = LogisticRegression()
model.fit(X_tfidf, y)

# Save model and vectorizer
joblib.dump(model, 'scam_model.pkl')
joblib.dump(vectorizer, 'vectorizer.pkl')

print("Model and vectorizer saved successfully.")
