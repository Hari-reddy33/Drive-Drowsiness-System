# Driver Drowsiness Monitoring System

## Project Overview

The Driver Drowsiness Monitoring System is a computer vision-based safety application designed to detect signs of driver drowsiness in real time using a webcam. The system analyzes the driver's face and eye region to identify prolonged eye closure and generates an alert when potential drowsiness is detected. The primary objective is to improve driver safety by providing timely warnings and reducing the risk of accidents caused by fatigue or reduced alertness.

## Technology Stack

**Programming Language:** Python  
**Computer Vision:** OpenCV  
**Face Detection:** Haar Cascade Classifier  
**Numerical Processing:** NumPy  
**Alert System:** Winsound  
**Development Environment:** Visual Studio Code

## System Development

The application is developed using Python and OpenCV to process live video captured through a webcam. OpenCV accesses the camera, reads video frames continuously, and performs image processing to detect the driver's face. The captured frames are converted into grayscale images to simplify processing and improve the efficiency of subsequent detection operations.

A Haar Cascade Classifier is used to detect the face within each frame. After locating the face, the system identifies the upper-face region and analyzes it for signs of eye closure. This approach enables continuous monitoring without requiring specialized camera hardware.

## Drowsiness Detection Logic

The system uses a frame-based approach to identify prolonged eye closure. It checks the detected eye information in consecutive video frames and maintains a counter when the eyes are not detected. Short interruptions, such as natural blinking, are less likely to trigger an alert because the counter must reach a predefined threshold.

When the counter reaches 20 consecutive frames, the application identifies a potential drowsiness event and displays a visual warning using OpenCV's text-rendering functionality. The system also generates an audible warning using Python's Winsound module to attract the driver's attention.

The detection threshold can be adjusted to balance responsiveness and false alerts. However, the system relies on visual detection rather than directly measuring a driver's actual alertness, so its results may be affected by lighting conditions, camera positioning, and partial facial obstruction.

## Real-Time Monitoring and Alert System

The application continuously processes incoming webcam frames, detects facial regions, and evaluates eye visibility. When the defined threshold is reached, a warning message reading “Drowsiness Alert” appears on the video feed, accompanied by an audible beep. This combination of visual and audio notifications is intended to help alert the driver to possible fatigue.

The system is designed to run on a standard computer with a webcam, making it a low-cost prototype for exploring computer vision applications in road safety.

## Project Objective and Learning Outcomes

The main objective of this project is to demonstrate how computer vision can be applied to driver monitoring and accident-prevention concepts. Developing the application provided practical experience with Python programming, real-time video processing, grayscale image conversion, Haar Cascade face detection, region-of-interest analysis, conditional logic, frame counting, and alert generation.

The project also provided an understanding of the challenges involved in real-time detection, including false positives, changes in lighting, and the limitations of detecting eye closure using conventional computer vision techniques. The system serves as an educational prototype for driver-safety monitoring and could be extended with more advanced eye-state detection, head-pose estimation, and machine learning techniques.
