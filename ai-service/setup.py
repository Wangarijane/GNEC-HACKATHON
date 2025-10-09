from setuptools import setup, find_packages

setup(
    name="foodbridge-ai-service",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "flask==2.3.3",
        "flask-cors==4.0.0", 
        "requests==2.31.0",
        "numpy==1.24.3",
        "pandas==1.5.3",
        "scikit-learn==1.2.2",
        "python-dotenv==1.0.0",
        "schedule==1.2.0",
        "geopy==2.3.0",
        "pymongo==4.4.1",
        "gunicorn==20.1.0",
    ],
    python_requires=">=3.10",
)