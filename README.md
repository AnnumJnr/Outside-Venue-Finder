# Outside Venue Finder

A Django web application built with Django REST Framework for discovering venues. This project provides a RESTful API backend, and is designed to be easily run on any device with Python and Django installed.
The app is not completed yet and so the search function only works for locations in Acccra. So for now, when you select a category, just type Accra and click on search and the various locations should show. Also the map has a bit of an issue which I am currently working on as well as a few features I might add. All changes done will be immediately updated to this repo

## Features

- Django REST Framework-based API
- Venue search and filtering
- CORS support for frontend integration
- Image processing and uploads
- Uses OpenStreetMap data via Overpy
- Secure environment configuration

## Requirements

Install the following packages with these up-to-date versions:

```
Django==5.2.7
django-filter==24.2
djangorestframework==3.16.1
requests==2.31.0
pyyaml==6.0.1
django-cors-headers==4.3.1
python-decouple==3.8
Pillow==10.3.0
overpy==0.6
```

You can install all dependencies at once:
```bash
pip install Django==5.2.7 django-filter==24.2 djangorestframework==3.16.1 requests==2.31.0 pyyaml==6.0.1 django-cors-headers==4.3.1 python-decouple==3.8 Pillow==10.3.0 overpy==0.6
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/AnnumJnr/Outside-Venue-Finder.git
cd Outside-Venue-Finder
```

### 2. Install Dependencies

(You may wish to use a virtual environment.)

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Setup

Create a `.env` file in the project root for environment variables, e.g.
```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 4. Database Migration

```bash
python manage.py migrate
```

### 5. Run the Development Server

```bash
python manage.py runserver
```

The app will be available at: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

## API Usage

See the `/api/` endpoint for RESTful API access. For more details, refer to the Django REST Framework documentation.

## Notes

- If deploying, set `DEBUG=False` and properly configure allowed hosts and secret keys.
- Pillow is required for image processing.
- Overpy is used to connect to OpenStreetMap APIs.



## References

- [Django Official Site](https://www.djangoproject.com/download/)
- [django-filter PyPI](https://pypi.org/project/django-filter/)
- [Django REST Framework Release Notes](https://www.django-rest-framework.org/community/release-notes/)
- [PyYAML PyPI](https://pypi.org/project/PyYAML/)
- [django-cors-headers PyPI](https://pypi.org/project/django-cors-headers/)
- [python-decouple PyPI](https://pypi.org/project/python-decouple/)
- [Pillow PyPI](https://pypi.org/project/Pillow/)
- [overpy PyPI](https://pypi.org/project/overpy/)

---

For any issues or contributions, please open an issue or pull request on the repository.
