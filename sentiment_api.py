from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import load_model
import pickle

app = Flask(__name__)
CORS(app)

# Load the model and tokenizer
try:
    model = load_model("sentiment_model_pr.h5")
    with open("tokenizer.pkl", "rb") as f:
        tokenizer = pickle.load(f)
    print("Model and tokenizer loaded successfully!")
except Exception as e:
    print(f"Error loading model or tokenizer: {e}")

# Configure parameters to match training
max_len = 100

@app.route('/predict_sentiment', methods=['POST'])
def predict_sentiment():
    try:
        # Get the review text from the request
        data = request.get_json()
        review = data.get('review', '')

        if not review:
            return jsonify({'error': 'No review text provided'}), 400

        # Preprocess the input text
        sequence = tokenizer.texts_to_sequences([review])
        padded_sequence = pad_sequences(sequence, maxlen=max_len, padding="post")

        # Predict sentiment
        prediction = model.predict(padded_sequence)
        sentiment_index = np.argmax(prediction)

        # Map index to sentiment label
        sentiment_labels = {0: "Negative", 1: "Neutral", 2: "Positive"}
        verdict = sentiment_labels[sentiment_index]

        return jsonify({
            'status': 'success',
            'verdict': verdict,
            'confidence': float(prediction[0][sentiment_index])
        })

    except Exception as e:
        print(f"Error in sentiment prediction: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)