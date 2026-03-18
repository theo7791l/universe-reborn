#!/bin/bash
# =============================================================
#  Universe Reborn — Script de démarrage Pterodactyl
# =============================================================

set -e

echo "====================================="
echo "  Universe Reborn — Démarrage"
echo "====================================="

# Variables avec valeurs par défaut
PORT=${PORT:-8000}
FLASK_ENV=${FLASK_ENV:-production}
GUNICORN_WORKERS=${GUNICORN_WORKERS:-2}

# Charger les variables d'environnement depuis .env si présent
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo "[OK] Variables .env chargées"
fi

# Exporter pour Flask
export FLASK_ENV=$FLASK_ENV
export FLASK_APP=wsgi.py

echo "[INFO] Environnement : $FLASK_ENV"
echo "[INFO] Port          : $PORT"
echo "[INFO] Workers       : $GUNICORN_WORKERS"

# Installer / mettre à jour les dépendances
echo "[INFO] Vérification des dépendances..."
pip install -r requirements.txt -q

# Initialiser la base de données si nécessaire
echo "[INFO] Initialisation de la base de données..."
python -c "
from app import create_app
from app.models import db
app = create_app()
with app.app_context():
    db.create_all()
    print('[OK] Base de données prête')
"

# Démarrage de Gunicorn
echo "[INFO] Lancement de Gunicorn..."
exec gunicorn \
  --bind 0.0.0.0:${PORT} \
  --workers ${GUNICORN_WORKERS} \
  --worker-class sync \
  --timeout 120 \
  --access-logfile - \
  --error-logfile - \
  --log-level info \
  wsgi:app
