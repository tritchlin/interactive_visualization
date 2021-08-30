# Flask base code copied from https://github.com/samirsaci/matrix_chart_duplicate/blob/main/app.py to start project
from flask import Flask, render_template, request, redirect, jsonify
import json

app = Flask(__name__)

PATH_IN = r'static\data\app.json'

@app.route("/")
def index():
    return render_template("index.html")


# Post json
@app.route('/get-json', methods=['GET', 'POST'])
def get_json():
    # Import Data
    with open(PATH_IN) as f:
        json_to = json.load(f)
    return jsonify(json_to) 


if __name__ == "__main__":
    app.run(debug=True)
