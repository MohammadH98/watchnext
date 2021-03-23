from flask import Flask
app = Flask(__name__)

import pandas as pd
import numpy as np
from zipfile import ZipFile
from pathlib import Path
import json
import tensorflow as tf
from tensorflow import keras
from flask import jsonify

# src imports
from recommender import neuMF
from exceptions import InvalidUsage

EMBEDDING_SIZE = 50
PRODUCTION = False

@app.errorhandler(InvalidUsage)
def handle_user_id_exception(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    print(response)
    return response

@app.route('/favourites/<user_id>')
def top_ten(user_id):
    user_id = int(user_id)
    if ( user_id > num_users or user_id < 0): raise InvalidUsage("User_ID not found",status_code=404) 
    movies_watched_by_user = rating_df[rating_df.userId == user_id]
    top_movies_user = (
        movies_watched_by_user.sort_values(by="rating", ascending=False)
        .head(5)
        .movieId.values
    )
    movie_df_rows = movie_df[movie_df["movieId"].isin(top_movies_user)]

    top = [
        {
            'title': row.title,
            'genre': row.genres.split("|"),
            'rank': n 
        } for n, row in enumerate(movie_df_rows.itertuples())
    ]

    response = app.response_class(  
        response=json.dumps(top),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route('/recommendations/<user_id>')
def next_ten(user_id):
    user_id = int(user_id)
    movies_not_watched = movie_df[
        ~movie_df["movieId"].isin(rating_df[rating_df.userId == user_id].movieId.values)
    ]["movieId"]
    movies_not_watched = list(
        set(movies_not_watched).intersection(set(movie2movie_encoded.keys()))
    )
    movies_not_watched = [[movie2movie_encoded.get(x)] for x in movies_not_watched]
    user_encoder = user2user_encoded.get(user_id)
    user_movie_array = np.hstack(
        ([[user_encoder]] * len(movies_not_watched), movies_not_watched)
    )
    ratings = model.predict(user_movie_array).flatten()
    top_ratings_indices = ratings.argsort()[-10:][::-1]
    
    recommended_movie_ids = [
        movie_encoded2movie.get(movies_not_watched[x][0]) for x in top_ratings_indices
    ]
    
    recommended_movies = movie_df[movie_df["movieId"].isin(recommended_movie_ids)]

    recommended_movie_ids = [netflix_encoder[i] for i in recommended_movie_ids]
    

    recommendations = [
        {
            'title': row.title,
            'genre': row.genres.split("|"),
            'id': row[1]
        }
       for row in recommended_movies.itertuples() ]
       
    s = {
        'recommendations': recommendations,
        'ids': recommended_movie_ids
    }

    response = app.response_class(  
        response=json.dumps(s),
        status=200,
        mimetype='application/json'
    )
    return response

def pull_data():
    keras_datasets_path = Path("~/.keras/datasets/")
    movielens_dir = keras_datasets_path / "ml-latest"
    if not movielens_dir.exists():
        # Download it
        movielens_data_file_url = (
            "http://files.grouplens.org/datasets/movielens/ml-latest.zip"
        )
        movielens_zipped_file = keras.utils.get_file(
            "ml-latest.zip", movielens_data_file_url, extract=False
        )
        with ZipFile(movielens_zipped_file, "r") as zipped:
            # Extract files
            print("Extracting all the files now...")
            zipped.extractall(path=keras_datasets_path)
            print("Done!")
    ratings_file = movielens_dir / "ratings.csv"
    
    rating_df = pd.read_csv(ratings_file)  
    
    netflix = pd.read_json("feb9_full_response_copy.json")

    movie_file = movielens_dir / "movies.csv"
    movie_df = pd.read_csv(movie_file)
    movie_df.title = [ i[:-7] for i in movie_df['title'].values]
    
    net = set(netflix['title'])
    ml = set( [i.strip().strip('"').strip("'").strip('`') for i in set(movie_df['title']) if not i == ''] )
    overlap = ( net.intersection(ml) )

    movie_df = movie_df[movie_df['title'].isin(overlap)]
    
    netflix.title = netflix.title.astype(str)
    movie_df.title = movie_df.title.astype(str)
    
    movie_df = netflix.merge(movie_df, on='title').drop(columns=['year','maturity_rating','description','media','meta','image','duration','genre'])
    rating_df = rating_df[rating_df['movieId'].isin(movie_df.movieId.values)]

    encoder_decoder = lambda id1,id2: ({x: i for i,x in zip(id1,id2)},  {i: x for i,x in zip(id1,id2)})
    ml2netflix, netflix2ml = encoder_decoder(movie_df['id'],movie_df['movieId'])
    
    return rating_df, movie_df, ml2netflix, netflix2ml

def test_train_split(rating_df, ratio=0.5):
    rating_df = rating_df.sample(frac=1, random_state=42)
    x = rating_df[["user", "movie"]].values
    y = rating_df["rating"].apply(lambda x: (x - min_rating) / (max_rating - min_rating)).values #

    # Assuming training on 90% of the data and validating on 10%.
    train_indices = int(ratio * rating_df.shape[0])
    return (
        x[:train_indices],
        x[train_indices:],
        y[:train_indices],
        y[train_indices:],
    )

def load_model(num_users, num_movies, rating_df, weight_path='.'):
    model = neuMF(int(num_users), num_movies, EMBEDDING_SIZE)
    model.compile(
        loss=tf.keras.losses.BinaryCrossentropy(), optimizer=keras.optimizers.Adam(lr=0.001)
    )
    x_train, x_val, y_train, y_val = test_train_split(rating_df)

    if not PRODUCTION:
        
        model.fit(
            x=x_train,
            y=y_train,
            batch_size=512,
            epochs=2,
            verbose=1,
            validation_data=(x_val, y_val),
        )   

        model.save_weights('/home/jacob/WatchNext/recommender/')
    else:
        model.build((2185, 2))
        model.load_weights('/home/jacob/WatchNext/recommender/checkpoint')
    return model 
if __name__ == '__main__':
    rating_df, movie_df,netflix_encoder,netflix_decoder = pull_data()

    # Returns a dictionary mapping between the movie_id and the training id
    encoder_decoder = lambda ids: ({x: i for i,x in enumerate(ids)},  {i: x for i,x in enumerate(ids)})

    user_ids = rating_df["userId"].unique().tolist()

    user2user_encoded, userencoded2user = encoder_decoder(user_ids)

    movie_ids = rating_df["movieId"].unique().tolist()

    movie2movie_encoded, movie_encoded2movie = encoder_decoder(movie_ids)

    rating_df["user"] = rating_df["userId"].map(user2user_encoded)
    rating_df["movie"] = rating_df["movieId"].map(movie2movie_encoded)

    num_users_train = len(user2user_encoded)
    num_users = num_users_train#*2
    num_movies = len(movie_encoded2movie)

    rating_df["rating"] = rating_df["rating"].values.astype(np.float32)

    # min and max ratings will be used to normalize the ratings later
    min_rating = min(rating_df["rating"])
    max_rating = max(rating_df["rating"])
    
    model = load_model(num_users, num_movies,rating_df)
    
    app.run()
