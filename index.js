'use strict';

const express = require('express');
const app = express();

app.listen(4200, () => {
    console.log('running in 4200...');
});

app.use(express.json());

// Your code starts here. Placeholders for .get and .post are provided for
//  your convenience.

app.post('/candidates', function(req, res) {
    try{
        if(req && req.body){
            let body = req.body;
            let validReq = validateRequest(body);
            let valid = validateAddCandidate(body);
            if (!valid && validReq) {
                addCandidate(body);
                fillResponse(res,200,'OK', 'Candidate added ok');
            } else {
                fillResponse(res,200,'ERROR', 'The candidate was added previously');
            }

        } else {
            fillResponse(res,400,'BAD REQUEST', 'Error, you must send a candidate to add');
        }

    }catch(err){
        console.error(err);
        fillResponse(res,404,'NOT FOUND', 'Error adding the candidate');
    }

});

app.get('/candidates/search/:skill', async function(req, res) {
    try{
        if(req && req.params){
            let response = await searchCandidate(req);
            response.length < 1 ? fillResponse(res,404,'NOT FOUND', 'There are not candidates with these skills'):
                fillResponse(res,200,'OK', JSON.stringify(response));
        }else{
            fillResponse(res,200,'Error', 'Error, you must send a skill to search');
        }
    }catch(err){
        console.error(err);
        fillResponse(res,404,'NOT FOUND', 'Error searching the candidate');
    }

});

app.listen(process.env.HTTP_PORT || 3000);


class Candidates{
    constructor(request){
        this.id = request.id;
        this.name = request.name;
        this.skills = request.skills;
    }

}

var ArrayCandidates = [];

// it can be do with joi lib
function validateRequest(req){
    let valid = false;
    let idValid = false;
    let nameValid = false;
    let skillsValid =  false;

    (req.id.length) > 100 || (req.id.length) < 1 ? idValid = false : idValid = true;
    (req.name.length) > 100 || (req.name.length) < 1 ? nameValid = false : nameValid = true;
    (req.skills.length) > 10000 || (req.skills.length) < 1 ? skillsValid = false : skillsValid = true;

    (idValid && nameValid && skillsValid) ? valid = true : valid = false;

    return valid;
}

function validateAddCandidate(req){
    let duplicated = false;
    ArrayCandidates.forEach(function(newCandidate){
        (newCandidate.id === req.id) ? duplicated = true : duplicated = false ;
    });
    return duplicated;
}

function addCandidate(req) {
    try{
        ArrayCandidates.push(new Candidates(req));
    } catch(err){
        console.error(err);
    }
}

function fillResponse(res, status,statusMsg, msg){
    res.status(status).json({
        status: statusMsg,
        message: msg
    });
}

function searchCandidate(req){
    let skills = req.params.skill.split(',');
    let counter = 0;
    let counter2 = 0;
    let candidateFounded;

    return new Promise (async (resolve, reject) => {
        try{
            ArrayCandidates.forEach(function(candidate){
                candidate.skills.forEach(function(skill){
                    for(let i = 0; i<skills.length; i++ ){
                        if(skill === skills[i]){
                            counter ++;

                        }
                    }
                });
                if(counter > counter2){
                    // *** solution should return any of the candidates if equally skilled
                    // here return the first that have more coincidences
                    candidateFounded = candidate;
                    counter2 = counter;
                    counter = 0;
                } else {
                    counter = 0;
                }
            });

            resolve(candidateFounded);
        }catch(err){
            reject(err);
        }
    })

}
