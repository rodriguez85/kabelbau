# Kabelbau – Docker Deployment

## Build

```bash
docker build -t kabelbau .
```

## Starten

```bash
docker run -d \
  --name kabelbau \
  -p 3000:3000 \
  -v /pfad/auf/dem/host:/data \
  --restart unless-stopped \
  kabelbau
```

Die App ist danach unter `http://server-ip:3000` erreichbar.

## Datenspeicher

Projekte werden im Container unter `/data` als JSON-Dateien gespeichert.  
Dieses Verzeichnis wird per `-v` auf einen Host-Pfad gemappt, damit die Daten beim Neustart erhalten bleiben.

| Parameter | Beschreibung |
|-----------|-------------|
| `/pfad/auf/dem/host` | Beliebiges Verzeichnis auf dem Server, z.B. `/home/user/kabelbau-data` oder `/opt/kabelbau/data` |
| `/data` | Fester Pfad im Container – nicht ändern |

### Beispiele

```bash
# Daten in /opt/kabelbau/data speichern
docker run -d -p 3000:3000 -v /opt/kabelbau/data:/data kabelbau

# Daten im Home-Verzeichnis
docker run -d -p 3000:3000 -v ~/kabelbau-data:/data kabelbau
```

Der Host-Pfad wird automatisch erstellt, falls er noch nicht existiert.

## Umgebungsvariablen

| Variable | Default | Beschreibung |
|----------|---------|-------------|
| `PORT` | `3000` | Port, auf dem der Server lauscht |
| `DATA_DIR` | `/data` | Pfad zum Datenspeicher im Container |

## Backup

Alle Projekte liegen als `<projektname>.json` im gemappten Host-Verzeichnis und können einfach kopiert oder gesichert werden.
