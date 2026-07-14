const getFilmes = function(){
    let listaDeFilmes = require('../modulo/filmes.js');

    return listaDeFilmes.filmes;
}

module.exports = {getFilmes}