from flask import Flask, render_template, request, jsonify

# Define app and static/template folders
app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/')
def home():
    return render_template('index.html')

# --- Optional: API route for testing ---
@app.route('/test')
def test():
    return "✅ Flask is running fine!"

if __name__ == '__main__':
    # Bind to 0.0.0.0 to avoid local access issues
    app.run(debug=True, host='0.0.0.0', port=5000)
