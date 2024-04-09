from flask import Flask, render_template, request, send_file
import os
import cv2

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

def create_video_from_image(image_path, video_duration):
    # Read the image
    img = cv2.imread(image_path)
    
    # Get the dimensions of the image
    height, width, _ = img.shape
    
    # Calculate the total number of frames based on the desired duration
    total_frames = int(video_duration * 30)  # Assuming a frame rate of 30 fps
    
    # Create a VideoWriter object
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Specify the codec
    output_video_path = 'output_video.mp4'
    out = cv2.VideoWriter(output_video_path, fourcc, 30, (width, height))
    
    # Write the same image for the specified duration
    for _ in range(total_frames):
        out.write(img)
    
    # Release the VideoWriter
    out.release()
    return output_video_path

@app.route('/generate_video', methods=['POST'])
def generate_video():
    try:
        image_file = request.files['image']
        duration = int(request.form['duration'])
        
        if not image_file:
            return 'No image file provided', 400

        # Save the uploaded image to a temporary file
        image_path = 'temp_image.jpg'
        image_file.save(image_path)

        # Create video from image
        video_path = create_video_from_image(image_path, duration)

        # Delete the temporary image file
        os.remove(image_path)

        return send_file(video_path, as_attachment=True)
    except Exception as e:
        return str(e), 500

if __name__ == '__main__':
    app.run(debug=True)
