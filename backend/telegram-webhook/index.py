import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Telegram Bot webhook handler for referral program
    Args: event - HTTP request from Telegram with updates
          context - execution context with request_id
    Returns: HTTP response for Telegram
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    
    if not bot_token:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Bot token not configured'}),
            'isBase64Encoded': False
        }
    
    body_str = event.get('body', '{}')
    update = json.loads(body_str)
    
    message = update.get('message', {})
    chat_id = message.get('chat', {}).get('id')
    text = message.get('text', '')
    
    if not chat_id:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
    
    response_text = ''
    
    if text == '/start':
        response_text = """🤝 Добро пожаловать в Реферальную программу!

💎 Выберите тариф и получите звёзды Telegram:

✨ 15 звёзд — пригласи 15-20 друзей
💫 25 звёзд — пригласи 21-29 друзей  
🌟 50 звёзд — пригласи 31-40 друзей

📋 Условия:
1️⃣ Приглашаете друзей согласно тарифу
2️⃣ Отправляете скриншоты подтверждения
3️⃣ Ждёте 3 дня для проверки
4️⃣ Друзья остаются активными
5️⃣ Получаете звёзды!

🌐 Перейдите на наш сайт для подачи заявки"""
    else:
        response_text = "Используйте команду /start для начала работы с ботом"
    
    import urllib.request
    import urllib.parse
    
    api_url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    data = {
        'chat_id': chat_id,
        'text': response_text,
        'parse_mode': 'HTML'
    }
    
    req = urllib.request.Request(
        api_url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        urllib.request.urlopen(req)
    except Exception as e:
        print(f"Error sending message: {e}")
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True}),
        'isBase64Encoded': False
    }
