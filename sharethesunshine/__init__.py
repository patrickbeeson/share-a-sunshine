from flask import flask
import stripe

stripe_keys = {
	'secret_key': 'sk_test_BQokikJOvBiI2HlWgH4olfQ2',
	'publishable_key': 'pk_test_6pRNASCoBOKtIshFeQd4XMUh'
}

stripe.api_key = stripe_keys['secret_key']

app = Flask(__name__)

app.secret_key = '\x03V\x96\xb6{#\x9f\x14K\xef{\x86Z\x14\xafZK/-\x84\xb0O\xcd\x13'

import sharethesunshine.views

if __name__ == '__main__':
	app.run()