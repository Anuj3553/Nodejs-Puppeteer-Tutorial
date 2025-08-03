from captcha import TwoCaptcha
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

api_key = os.getenv('APIKEY_2CAPTCHA', '7fa6f14ca3f6bb886c388b475c9bd5d9')

solver = TwoCaptcha(api_key)

try:
    result = solver.normal(sys.argv[1])

except Exception as e:
    sys.stdout.flush()

else:
    print(str(result))
    sys.stdout.flush()