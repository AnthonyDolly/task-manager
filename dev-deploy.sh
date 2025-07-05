#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Iniciando deploy...${NC}"

# Bajar contenedores
echo -e "${YELLOW}📦 Bajando contenedores...${NC}"
docker compose down

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Contenedores bajados exitosamente${NC}"
else
    echo -e "${RED}❌ Error al bajar contenedores${NC}"
    exit 1
fi

# Limpiar imágenes
echo -e "${YELLOW}🧹 Limpiando imágenes obsoletas...${NC}"
docker image prune -f

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Imágenes limpiadas exitosamente${NC}"
else
    echo -e "${RED}❌ Error al limpiar imágenes${NC}"
    exit 1
fi

# Construir y levantar
echo -e "${YELLOW}🏗️ Construyendo y levantando contenedores...${NC}"
docker compose up --build -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deploy completado exitosamente${NC}"
    echo -e "${GREEN}🚀 Aplicación corriendo en segundo plano${NC}"
else
    echo -e "${RED}❌ Error en el deploy${NC}"
    exit 1
fi

# Mostrar estado final
echo -e "${YELLOW}📊 Estado de los contenedores:${NC}"
docker compose ps