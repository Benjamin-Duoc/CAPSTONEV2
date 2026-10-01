import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename

upload_bp = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'jfif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "No selected file"}), 400
    
    # Path inside media folder, default to 'images'
    # Use 'folder' from form if provided, e.g. 'images/hero'
    folder_path = request.form.get('folder', 'images')
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        
        # Base media directory (absolute path)
        # backend/media
        media_root = os.path.join(current_app.root_path, '..', current_app.config.get('MEDIA_FOLDER', 'media'))
        
        # Target directory inside media
        target_dir = os.path.join(media_root, folder_path)
        
        # Create directory if it doesn't exist
        os.makedirs(target_dir, exist_ok=True)
        
        # Full save path
        file_path = os.path.join(target_dir, filename)
        file.save(file_path)
        
        # Construct URL for the frontend
        # The 'serve_media' route matches /media/<path:filename>
        # So filename should be folder_path/filename
        url = f"/media/{folder_path}/{filename}"
        
        # Check if watermark is requested
        watermarked_url = None
        if request.form.get('watermark') == 'true':
            try:
                from PIL import Image
                img = Image.open(file_path).convert("RGBA")
                
                # Resize to max 1080px width
                max_width = 1080
                if img.width > max_width:
                    ratio = max_width / img.width
                    new_size = (max_width, int(img.height * ratio))
                    img = img.resize(new_size, Image.LANCZOS)
                
                # Attempt to load and paste logo
                logo_path = os.path.join(current_app.root_path, '..', '..', 'project', 'public', 'assets', 'images', 'LOGO-CIPRESS-2.png')
                if os.path.exists(logo_path):
                    logo = Image.open(logo_path).convert("RGBA")
                    # Resize logo to 30% of image width
                    lw = int(img.width * 0.3)
                    lr = lw / logo.width
                    logo = logo.resize((lw, int(logo.height * lr)), Image.LANCZOS)
                    
                    # Apply 50% transparency to logo
                    alpha = logo.split()[3]
                    logo.putalpha(alpha.point(lambda p: p * 0.5))
                    
                    x = (img.width - logo.width) // 2
                    y = (img.height - logo.height) // 2
                    
                    watermark_layer = Image.new('RGBA', img.size, (0,0,0,0))
                    watermark_layer.paste(logo, (x, y), logo)
                    img = Image.alpha_composite(img, watermark_layer)
                
                # Convert back and save with compression
                img = img.convert("RGB")
                filename_without_ext = os.path.splitext(filename)[0]
                watermarked_filename = f"{filename_without_ext}_watermarked.jpg"
                watermarked_path = os.path.join(target_dir, watermarked_filename)
                
                img.save(watermarked_path, "JPEG", quality=70)
                watermarked_url = f"/media/{folder_path}/{watermarked_filename}"
            except Exception as e:
                print(f"Error applying watermark: {e}")
        
        return jsonify({
            "success": True, 
            "url": url,
            "watermarked_url": watermarked_url,
            "message": "File uploaded successfully"
        }), 200
    
    return jsonify({"success": False, "message": "File type not allowed"}), 400
