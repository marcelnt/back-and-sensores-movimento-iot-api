/**************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, consistência de dados das 
 *      requisições da API de Filme
 * Data: 01/02/2024
 * Autor: Marcel
 * Versão: 1.0
 * 
 **************************************************************************************************************/

//Import do arquivo de configuração do projeto
const message = require('../modulo/config.js');

//Import do arquivo DAO que fará a comunicação com o Banco de Dados
const filmeDAO = require('../model/DAO/filme.js');

//Import do arquivo de UPLOAD da AZURE
const upload = require('../controller/upload/controllerUploadStorageAzure.js')

const dataAtual = new Date();

//Função para validar e inserir um novo Filme
const setInserirNovoLivro = async function(dadosFilme, contentType){
    try{
            
        //Validação do content-Type da requisição
        if(String(contentType).toLowerCase() == 'application/json'){

            //Cria o objeto JSON para devolver os dados criados na requisição
            let novoFilmeJSON = {};
            let statusRequiredFields = false

            //Validação de campos obrigatórios ou com digitação inválida
            if( dadosFilme.status == ''              || dadosFilme.status == undefined            || dadosFilme.status == null           || dadosFilme.status.length > 80              ||
                dadosFilme.dispositivo == ''         || dadosFilme.dispositivo == undefined       || dadosFilme.dispositivo == null      || dadosFilme.dispositivo.length > 100 
           
            ){
                return message.ERROR_REQUIRED_FIELDS; //400
            }else{

                //Encaminha os dados do Filme para o DAO inserir no BD
                let novoFilme = await filmeDAO.insertLivro(dadosFilme);

                //Validação para verificar se o DAO inseriu os dados do BD
                if(novoFilme){

                    
                    //Cria o JSON de retorno dos dados (201)
                    novoFilmeJSON.description = 'API para manipular livros'
                    novoFilmeJSON.development = 'Marcel Neves Teixeira'
                    novoFilmeJSON.date = dataAtual
                    novoFilmeJSON.version = '2.0'
                    novoFilmeJSON.livro         = dadosFilme;
                    novoFilmeJSON.status        = message.SUCCESS_CREATED_ITEM.status;
                    novoFilmeJSON.status_code   = message.SUCCESS_CREATED_ITEM.status_code;
                    novoFilmeJSON.message       = message.SUCCESS_CREATED_ITEM.message;

                    return novoFilmeJSON; //201
                }else{
                    return message.ERROR_INTERNAL_SERVER_DB; //500
                }
                
            }
        }else{
            return message.ERROR_CONTENT_TYPE; // 415
        }
    }catch(error){
        return message.ERROR_INTERNAL_SERVER; //500 erro na controller
    }
}

//Função para excluir um Filme
const setExcluirLivro = async function(idFilme){
    try{
        
            if(idFilme == '' || idFilme == undefined || isNaN(idFilme)){
                return message.ERROR_INVALID_ID; //400
            }else{
              
                let resultFilme = await getBuscarLivro(idFilme)
                
                if (resultFilme.status_code == 200){

                    //Encaminha os dados do Filme para o DAO inserir no BD
                    let novoFilme = await filmeDAO.deleteLivro(idFilme);
                    console.log(resultFilme)
                    //Validação para verificar se o DAO inseriu os dados do BD
                    if(novoFilme){
                        upload.deleteFiles(resultFilme.books[0].image)
                        return message.SUCCESS_DELETED_ITEM; //200
                    }else{
                        return message.ERROR_INTERNAL_SERVER_DB; //500
                    }
                }else{
                    return message.ERROR_NOT_FOUND //404
                }

                
  
            }
       
    }catch(error){
        return message.ERROR_INTERNAL_SERVER; //500 erro na controller
    }
}

//Função para retornar todos os Filmes
const getListarLivros = async function(){
    
    //Cria o objeto JSON
    let filmesJSON = {};
    
    //chama a função do DAO para retornar os dados da tabela de Filme
    let dadosFilmes = await filmeDAO.selectAllLivros();

    //Validação para verificar se existem dados
    if (dadosFilmes){
        //Cria o JSON para devolver para o APP
        filmesJSON.description = 'API para manipular Dados de Sensores de Movimento'
        filmesJSON.development = 'Marcel Neves Teixeira'
        filmesJSON.date = dataAtual
        filmesJSON.version = '2.0'

        filmesJSON.dados = dadosFilmes;
        filmesJSON.count = dadosFilmes.length;
        filmesJSON.status_code = 200; 
        return filmesJSON;
    }else{
        return false;
    }
}

//Função para buscar um filme pelo ID
const getBuscarLivro = async function(id){

    //Recebe o ID do Filme
    let idFilme = id;
    //Cria o objeto JSON
    let filmesJSON = {};

    let dadosFilme = null;

    //Validação para verificar se o ID é válido 
        //(vazio, indefinido ou não numérico)
    if(idFilme == '' || idFilme == undefined || isNaN(idFilme)){
        return message.ERROR_INVALID_ID; //400
    }else{

        //Encaminha o ID para o DAO buscar no Banco de dados
        dadosFilme = await filmeDAO.selectByIdLivro(idFilme);
        
        //Verifica se o DAO retornou dados
        if(dadosFilme != null){
            //console.log(dadosFilme)
            // console.log(dadosFilme)
            //Validação para verificar a quantidade de itens retornados
            if(dadosFilme.length > 0){
                //Cria o JSON para retorno
                filmesJSON.description = 'API para manipular livros'
                filmesJSON.development = 'Marcel Neves Teixeira'
                filmesJSON.date = dataAtual
                filmesJSON.version = '2.0'
                filmesJSON.books = dadosFilme;
                filmesJSON.status_code = 200;

                return filmesJSON;
            }else{
                return message.ERROR_NOT_FOUND; //404
            }
        }else{
            return message.ERROR_NOT_FOUND; //500
        }
    }
}


module.exports = {
    setInserirNovoLivro,
    setExcluirLivro,
    getListarLivros,
    getBuscarLivro
}



