import sys
import requests

# O token de acesso é passado como argumento
access_token = sys.argv[1]

# Obter as faixas curtidas
def get_liked_tracks(access_token):
    url = 'https://api.spotify.com/v1/me/tracks'
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    liked_tracks = []

    while url:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            liked_tracks.extend(item['track']['uri'] for item in data['items'])
            # Verifica se há mais faixas
            url = data['next']
        else:
            print(f"Erro ao obter faixas: {response.status_code} {response.text}")
            return None

    return liked_tracks

# Iniciar a reprodução
def play_tracks(access_token, track_uris):
    url = 'https://api.spotify.com/v1/me/player/play'
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    data = {
        "uris": track_uris
    }

    response = requests.put(url, headers=headers, json=data)

    if response.status_code == 204:
        print("Músicas reproduzindo...")
    else:
        print(f"Erro ao reproduzir: {response.status_code} {response.text}")

# Obter as faixas curtidas e reproduzir
liked_tracks = get_liked_tracks(access_token)
if liked_tracks:
    play_tracks(access_token, liked_tracks)
else:
    print("Nenhuma faixa encontrada para reproduzir.")
