from flask import Flask, request, send_file
from PIL import Image, UnidentifiedImageError
import pytesseract
import os
import zipfile
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize the global variable for the folder name
current_folder_name = None

@app.route('/api/upload_image/<folder_name>', methods=['POST'])
def upload_image(folder_name):
    global current_folder_name
    if 'filepond' not in request.files:
        return {'error': 'No file uploaded.'}

    main_img_folder = "D:\\img2txt-images\\"

    file = request.files['filepond']

    # Create a new folder to store the files for this request
    new_folder_path = os.path.join(main_img_folder, folder_name)

    if folder_name != current_folder_name:
        current_folder_name = folder_name
        if not os.path.exists(new_folder_path):
            os.makedirs(new_folder_path)

    filename = secure_filename(file.filename)
    file.save(os.path.join(new_folder_path, filename))

    img_path = os.path.join(new_folder_path, filename)

    # Create a text file with the extracted text
    txt_filename = f'{new_folder_path}/{filename}.txt'
    
    try:
        # Now we can use pytesseract to extract text from the image
        text = pytesseract.image_to_string(Image.open(img_path))
        with open(txt_filename, 'w') as f:
            f.write(text)
    except UnidentifiedImageError:
        return {'error': f'Failed to process image {filename}. Invalid image file.'}
    except Exception as e:
        return {'error': f'Unexpected error occurred while processing image {filename}: {str(e)}'}

    return {'message': 'File processed.'}

@app.route('/api/create_zip/<folder_name>', methods=['GET'])
def create_zip(folder_name):
    current_date = datetime.now().strftime('%m%d%y')
    main_img_folder = "D:\\img2txt-images\\"
    zip_filename = f'{main_img_folder}/output_{current_date}_{folder_name}.zip'
    folder_path = os.path.join(main_img_folder, folder_name)

    try:
        with zipfile.ZipFile(zip_filename, 'w') as z:
            for root, _, files in os.walk(folder_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    z.write(file_path, os.path.relpath(file_path, folder_path))
    except Exception as e:
        return {'error': f'Failed to create zip file: {str(e)}'}

    return send_file(zip_filename, as_attachment=True)

if __name__ == "__main__":
    app.run(port=5000, debug=True)
