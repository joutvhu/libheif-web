#!/bin/bash

VERSION="$1"
LIB_URL="https://github.com/strukturag/libheif/releases/download/v${VERSION}/libheif-${VERSION}.tar.gz"

echo "Downloading ${LIB_URL}"
wget $LIB_URL

if [ "$2" == "--extract" ]; then
  FILE_NAME="libheif-${VERSION}.tar.gz"
  FOLDER_NAME="libheif-${VERSION}"

  echo "Extracting $FILE_NAME"

  tar -xf $FILE_NAME

  mv $FOLDER_NAME libheif
fi;

echo "Done"
