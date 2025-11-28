import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Submit referral request from user
    Args: event - HTTP request with tariff_id, username, telegram_user_id
          context - execution context
    Returns: HTTP response with request ID
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
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_str = event.get('body', '{}')
    data = json.loads(body_str)
    
    tariff_id = data.get('tariff_id')
    username = data.get('username', '')
    telegram_user_id = data.get('telegram_user_id', 0)
    
    tariffs = {
        1: {'stars': 15, 'friends': '15-20'},
        2: {'stars': 25, 'friends': '21-29'},
        3: {'stars': 50, 'friends': '31-40'}
    }
    
    if tariff_id not in tariffs:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid tariff'}),
            'isBase64Encoded': False
        }
    
    tariff = tariffs[tariff_id]
    verification_date = datetime.now() + timedelta(days=3)
    
    database_url = os.environ.get('DATABASE_URL', '')
    
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    cur.execute("""
        INSERT INTO referral_requests 
        (telegram_user_id, username, tariff_id, tariff_stars, tariff_friends, status, verification_date)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (telegram_user_id, username, tariff_id, tariff['stars'], tariff['friends'], 'waiting', verification_date))
    
    request_id = cur.fetchone()[0]
    conn.commit()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'request_id': request_id,
            'verification_date': verification_date.isoformat()
        }),
        'isBase64Encoded': False
    }
