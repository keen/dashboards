FROM httpd

RUN apt-get update -y
WORKDIR /usr/local/apache2/htdocs/
ADD . /usr/local/apache2/htdocs/

EXPOSE 80 
