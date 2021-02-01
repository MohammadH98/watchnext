import React from 'react';

function getMovieData() {
    var MovieData = getMovieJSON()
    return parseMovieData(MovieData)
}

function parseMovieData(data) {
    //convert from json to object
    return data;
}

export { getMovieData }