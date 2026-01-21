FROM postgres:16

# Install PostGIS + pgvector packages (Debian 기반)
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     postgresql-16-postgis-3 \
     postgresql-16-postgis-3-scripts \
     postgresql-16-pgvector \
  && rm -rf /var/lib/apt/lists/*

# (선택) locale/timezone 필요하면 여기서 추가 가능