import spotipy
from spotipy.oauth2 import SpotifyOAuth
from spotipy.exceptions import SpotifyException
import sys

def play_liked_tracks(access_token):
    sp = spotipy.Spotify(auth=access_token)

    try:
        # Verifica se há dispositivos disponíveis
        devices = sp.devices()
        if not devices['devices']:
            print("Erro: Nenhum dispositivo disponível.")
            return

        # Obtém o ID do primeiro dispositivo disponível
        device_id = devices['devices'][0]['id']

        # Busca as músicas curtidas
        results = sp.current_user_saved_tracks()
        if not results['items']:
            print("Nenhuma música curtida encontrada.")
            return

        # Extrai os URIs das músicas curtidas
        uris = [item['track']['uri'] for item in results['items']]

        # Dá play nas músicas curtidas
        sp.start_playback(device_id=device_id, uris=uris)
        print("Reproduzindo músicas curtidas...")
    except SpotifyException as e:
        if e.http_status == 403 and 'PREMIUM_REQUIRED' in str(e):
            print("Erro: A reprodução exige uma conta Premium.")
        else:
            print(f"Ocorreu um erro: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python play_tracks.py <access_token>")
        sys.exit(1)

    access_token = sys.argv[1]
    play_liked_tracks(access_token)
