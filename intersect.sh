#!/usr/bin/env bash
set -eu
rm -f temp.gpkg

ogr2ogr -f GPKG temp.gpkg  /vsizip/vsicurl/https://geodata.nationaalgeoregister.nl/bestuurlijkegrenzen/extract/bestuurlijkegrenzen.zip/Landsgrens.gml Landsgrens -nln landsgrens

# ogr2ogr -update -f GPKG temp.gpkg bladindex_500.json bladindex_500 -nln bladindex_500_or
ogr2ogr -update -f GPKG temp.gpkg data_src/bladindex_1000.json bladindex_1000 -nln bladindex_1000_or
ogr2ogr -update -f GPKG temp.gpkg data_src/bladindex_2000.json bladindex_2000 -nln bladindex_2000_or
ogr2ogr -update -f GPKG temp.gpkg data_src/bladindex_5000.json bladindex_5000 -nln bladindex_5000_or

ogr2ogr -dialect sqlite -update -f GPKG temp.gpkg temp.gpkg -sql "select a.geom, a.id from bladindex_1000_or a, landsgrens b where ST_Intersects(a.geom, b.geom)" -nln bladindex_1000

ogr2ogr -dialect sqlite -update -f GPKG temp.gpkg temp.gpkg -sql "select a.geom, a.id from bladindex_2000_or a, landsgrens b where ST_Intersects(a.geom, b.geom)" -nln bladindex_2000

ogr2ogr -dialect sqlite -update -f GPKG temp.gpkg temp.gpkg -sql "select a.geom, a.id from bladindex_5000_or a, landsgrens b where ST_Intersects(a.geom, b.geom)" -nln bladindex_5000

# ogr2ogr -dialect sqlite -update -f GPKG temp.gpkg temp.gpkg -sql "select a.geom, a.id from bladindex_500_or a, landsgrens b where ST_Intersects(a.geom, b.geom)" -nln bladindex_500

# ogr2ogr -f GeoJSON bladindex_500_clipped.json temp.gpkg bladindex_500 -lco COORDINATE_PRECISION=0
ogr2ogr -f GeoJSON bladindex_1000_clipped.json temp.gpkg -dialect sqlite -sql "select *, id  from bladindex_1000" -lco COORDINATE_PRECISION=0 -nln bladindex_1000

ogr2ogr -f GeoJSON bladindex_2000_clipped.json temp.gpkg -dialect sqlite -sql "select *, id  from bladindex_2000" -lco COORDINATE_PRECISION=0 -nln bladindex_2000

ogr2ogr -f GeoJSON bladindex_5000_clipped.json temp.gpkg -dialect sqlite -sql "select *, id  from bladindex_5000" -lco COORDINATE_PRECISION=0 -nln bladindex_5000
