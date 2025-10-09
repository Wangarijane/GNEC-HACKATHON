from setuptools import setup, find_packages

setup(
    name="food_bridge_ai_service",
    version="0.1.0",
    packages=find_packages(include=["api", "models"]),  # List only code packages, not data
    include_package_data=True,
    install_requires=[],
)