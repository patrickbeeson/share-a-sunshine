# Share the Sunshine README

## Description

This Flask application drives the Share a Sunshine website and ecommerce functionality. It uses [Stripe](https://stripe.com/docs/checkout) to enable payment processing, and [Bootstrap](http://getbootstrap.com) for the visual grid and reponsive layout in addition to JS functionality. [Bourbon](http://bourbon.io) is used for CSS3 mixins.

## Structure

This application is laid out using the following conventions:

* `forms.py`: Contains the "share" form and authentication form for API access
* `models.py`: Contains the database models for Products, Purchases and Users
* `views.py`: Contains the view logic for the homepage, payment processing, thanks, terms and error pages as well as the API access
* `config.py`: Contains app configuration information
* `util/assets.py`: Contains the asset minifaction directives for CSS and JS files
* `runserver.py`: Is used in development to fire up the development server (not used in production)
* `__init__.py`: Fires the actual app for production use, and also contains error logging/reporting functions

Templates are the `templates` directory, and static files (js, css, images) are the the `static` directory.

All requirements are contained in the `requirements.txt` file.

## Error reporting

Application errors are logged in a log file and are emailed to the admin set in the config file.
