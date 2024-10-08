from flask import Flask, request, jsonify
import boto3
import json
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Initialize the Bedrock runtime client
client = boto3.client(
    'bedrock-runtime'
)

@app.route('/ask', methods=['POST'])
def ask_question():
    try:
        data = request.json
        question = data.get('question', '')
        content = data.get('content', '')

        if not question or not content:
            return jsonify({'error': 'Invalid input'}), 400

        # Combine the website content and question into a prompt
        prompt = f"Based on the following content:\n\n{content}\n\nAnswer the question: {question}"

        # Prepare the request body for Llama
        request_body = {
            "prompt": prompt,
            "max_gen_len": 512,
            "temperature": 0.7,
            "top_p": 0.9,
        }

        # Call the LLaMA model via Amazon Bedrock
        response = client.invoke_model(
            modelId='meta.llama3-1-405b-instruct-v1:0',  # Note: modelId, not model_id
            body=json.dumps(request_body)
        )
        
        # Parse the response
        response_body = json.loads(response['body'].read())
        generated_text = response_body.get('generation', '')
        print(generated_text)
        return jsonify({'reply': generated_text})

    except Exception as e:
        print(f"Error: {str(e)}")  # Log the error for debugging
        return jsonify({'error': 'An error occurred', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)