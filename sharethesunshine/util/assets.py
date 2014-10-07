from flask_assets import Bundle, Environment

from sharethesunshine import app

assets = Environment(app)

js = Bundle('scripts/main.js',
            'scripts/grids.min.js',
            'scripts/jquery.limit-1.2.js',
            'scripts/bootstrap/carousel.js',
            'scripts/bootstrap/collapse.js',
            'scripts/bootstrap/alert.js',
            'scripts/bootstrap/button.js',
            'scripts/bootstrap/transition.js',
            filters='jsmin', output='gen/packed.js')
css = Bundle('css/main.css', filters='cssmin', output='gen/packed.css')
assets.register('js_all', js)
assets.register('css_all', css)
