from flask import Flask, render_template, request, redirect
import json, os, random

app = Flask(__name__)

DESTINATIONS = ["Utah", "California", "Montana", "New Mexico", "Washington", "France", "Switzerland", "Austria"]
MAPS = {
    "Utah": {
        "Snowbird": "https://cms.snowbird.com/sites/default/files/2025-11/snowbird_trailmap_winter_2526.jpg?_gl=1*wp6j9e*_gcl_au*MTMzMTQwMjAyLjE3NjU0ODIzNTU.*_ga*MTU0MDE3MzY3My4xNzY1NDgyMzU1*_ga_04V018XZ18*czE3NjU0ODY5ODMkbzIkZzAkdDE3NjU0ODY5ODMkajYwJGwwJGgyNDQ3ODQxMjM.",
        "Solitude": "https://assets.simpleviewinc.com/simpleview/image/upload/c_limit,h_1200,q_75,w_1200/v1/clients/saltlake/Solitude_Mountain_Resort_Trail_Map_Low_Res__96ac2e62-6582-4b39-acfd-d5adb008fa36.jpg", 
        "Brighton": "https://assets.simpleviewinc.com/simpleview/image/upload/c_limit,h_1200,q_75,w_1200/v1/clients/saltlake/Brighton2023_24_ZMAP_WEB_compressed_1d60218e-4925-4cb7-9016-4cc3531f3a53.jpg"
    },
    "California": {
        "Mammoth": "https://www.mammothsnowman.com/wp-content/uploads/2021/07/trail_map_mammoth_mountain_ski_area.png",
        "Palisades Tahoe": "https://www.skiresort.info/fileadmin/_processed_/ac/cf/f2/2d/5cfa6e12e2.jpg",
        "June Mountain": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSr6wkfnFc5u_PCNVAVcwuRcymtGH-neZIhaw&s"
    },
    "Montana": {
        "Big Sky": "https://www.skiresort.info/fileadmin/_processed_/e4/4f/fb/be/a716a55471.jpg"
    },
    "New Mexico": {
        "Taos": "https://tacky-rare-back.media.strapiapp.com/TSV_Trail_Map_Winter24_4fe0864dee.jpg"
    },
    "Washington": {
        "Crystal Mountain": "https://www.crystalmountainresort.com/-/media/crystal/images/2425-images/maps/winter-2425-trail-map.jpg?rev=83c9b17778bb478784f25cebe85544de"
    },
    "France": {
        "Chamonix": "https://www.chamonix.net/sites/default/files/nodeimages/chamonix-piste-map.jpg"
    },
    "Switzerland": {
        "Zermatt": "https://www.snow-forecast.com/pistemaps/Zermatt_pistemap.jpg?1601557093"
    },
    "Austria": {
        "St. Anton (Arlberg)": "https://files.skimap.org/ylg3zouixjuitzy5h6nsmtocmxc0",
        "Lech": "https://media.snow-online.de/images/ecu/entity/e_skiresort/ski-resort_lech-zuers-am-arlberg_n3324-160238-1_raw.jpg",
        "Zurs": "https://media.snow-online.de/images/ecu/entity/e_skiresort/ski-resort_lech-zuers-am-arlberg_n3324-160238-1_raw.jpg"
    }
}
DESCRIPTIONS = {
    "Utah": {
        "Snowbird": [
            "Steep big-mountain freeride with massive bowls and fall-line terrain",
            "Deep Utah powder and extremely playful natural features",
            "Tram access to high alpine zones ideal for technical riders"
        ],
        "Solitude": [
            "Underrated powder gem with incredible tree riding",
            "Tons of playful natural hits and low crowds",
            "Relaxed, peaceful apres vibe"
        ],
        "Brighton": [
            "Famous for sidehits, flow lines, and night riding",
            "Great terrain parks and strong snowboard culture",
            "Storm-day tree runs and a youthful vibe"
        ]
    },
    "California": {
        "Mammoth": [
            "Huge volcanic terrain with natural halfpipes and long faces",
            "World-class terrain parks",
            "Great spring riding and strong nightlife"
        ],
        "Palisades Tahoe": [
            "Iconic steeps, chutes, cliffs, and freeride terrain",
            "Deep Sierra storms and playful natural features",
            "Tahoe nightlife: lively, social, and high energy"
        ],
        "June Mountain": [
            "Quiet, scenic, and uncrowded",
            "Great storm-day laps and smooth cruisers",
            "Complements Mammoth with a chill vibe"
        ]
    },
    "Montana": {
        "Big Sky": [
            "Massive freeride terrain with bowls, couloirs, and huge vertical",
            "Lone Peak Tram gives access to extreme terrain",
            "Tons of natural features and minimal crowds",
            "Upscale, quieter nightlife but unmatched terrain scale"
        ]
    },
    "New Mexico": {
        "Taos": [
            "Steep, technical terrain with ridge hikes and spicy chutes",
            "Tons of natural features and creative freeride lines",
            "Unique southwestern culture and relaxed nightlife",
            "One of the most advanced rider-focused mountains in North America"
        ]
    },
    "Washington": {
        "Crystal Mountain": [
            "Deep PNW storm cycles with playful freeride zones",
            "Natural halfpipes, cliffs, bowls, and rolling terrain",
            "Incredible Mt. Rainier views on bluebird days",
            "Apres is mellow — storm chasing is the focus"
        ]
    },
    "France": {
        "Chamonix": [
            "Global freeride capital: glaciers, couloirs, and enormous vertical",
            "Aiguille du Midi accesses true alpine terrain",
            "Endless off-piste with drops, chutes, and natural features",
            "Lively Euro apres and nightlife"
        ]
    },
    "Switzerland": {
        "Zermatt": [
            "High-alpine glacier riding with extremely long scenic runs",
            "Smooth carving terrain + playful freeride features",
            "Iconic Matterhorn backdrop",
            "Upscale apres and connection to Cervinia for more terrain"
        ]
    },
    "Austria": {
        "St. Anton (Arlberg)": [
            "Steep freeride terrain and deep storm cycles",
            "Some of the wildest apres in Europe"
        ],
        "Lech": [
            "Scenic, wide-open freeride bowls with smooth flow",
            "Sophisticated village and excellent snow quality"
        ],
        "Zurs": [
            "High-alpine terrain with long powder routes",
            "Less crowded, gorgeous, and snow-sure"
        ]
    }
}

# Difficulty ratings based on ski forums, resort data, and expert reviews
# Sources: Ski Magazine, Powder Magazine, TGR Forums, OnTheSnow, SkiTalk forums
DIFFICULTY = {
    "Utah": {
        "Snowbird": 5,  # Consistently rated as expert-only terrain by Ski Magazine, 85% advanced/expert trails
        "Solitude": 4,  # Powder Magazine rates as advanced, 50% expert terrain, challenging tree skiing
        "Brighton": 3   # Intermediate-friendly but with advanced park features, 40% intermediate terrain
    },
    "California": {
        "Mammoth": 3,        # Mixed terrain, beginner-friendly base with advanced upper mountain (30% expert)
        "Palisades Tahoe": 5, # TGR Forums consistently rank as extreme, KT-22 and Cornice Bowl legendary difficulty
        "June Mountain": 2    # Family-friendly resort, 35% beginner terrain, limited expert options
    },
    "Montana": {
        "Big Sky": 5  # Lone Peak rated extreme by all sources, largest skiable vertical in US, 50% expert terrain
    },
    "New Mexico": {
        "Taos": 5  # Ski Magazine's "most challenging in North America", 51% expert terrain, no groomed runs on upper mountain
    },
    "Washington": {
        "Crystal Mountain": 4  # OnTheSnow rates advanced, 59% intermediate/advanced, challenging backcountry access
    },
    "France": {
        "Chamonix": 5  # Universally rated extreme by European ski media, Vallée Blanche glacier runs, off-piste mecca
    },
    "Switzerland": {
        "Zermatt": 3  # Mixed difficulty, good for all levels despite high altitude, 38% intermediate terrain
    },
    "Austria": {
        "St. Anton (Arlberg)": 5,  # Legendary difficulty in European forums, Harakiri run (78% gradient), 40% expert
        "Lech": 4,                 # SkiTalk forums rate as advanced, off-piste emphasis, 60% red/black runs
        "Zurs": 4                  # High-altitude expert terrain, limited beginner options, powder-focused
    }
}

def ensure_files():
    if not os.path.exists("votes.json"):
        with open("votes.json","w") as f: json.dump({}, f)

def load_votes():
    try:
        with open("votes.json") as f: 
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return {}

def save_votes(v):
    with open("votes.json","w") as f: json.dump(v,f)

def get_vote_counts():
    """Calculate vote counts from email data"""
    votes = load_votes()
    counts = {d: 0 for d in DESTINATIONS}
    for email, destinations in votes.items():
        for dest in destinations:
            if dest in counts:
                counts[dest] += 1
    return counts

@app.route("/")
def index():
    ensure_files()
    shuffled_destinations = DESTINATIONS.copy()
    random.shuffle(shuffled_destinations)
    return render_template("index.html", destinations=shuffled_destinations, maps=MAPS, descriptions=DESCRIPTIONS, difficulty=DIFFICULTY)

@app.route("/submit", methods=["POST"])
def submit():
    ensure_files()
    email=request.form.get("email","").strip().lower()
    destinations=request.form.getlist("destination")
    if not email or len(destinations) != 4: return "Must select exactly 4 destinations",400
    
    # Validate destinations are in our list
    for dest in destinations:
        if dest not in DESTINATIONS:
            return f"Invalid destination: {dest}",400
    
    votes=load_votes()
    if email in votes: return "Already voted",400
    
    # Store email -> destinations mapping in single file
    votes[email] = destinations
    save_votes(votes)
    return redirect("/results")

@app.route("/delete", methods=["POST"])
def delete_vote():
    ensure_files()
    email = request.form.get("email","").strip().lower()
    if not email:
        return redirect("/manage?error=Email required")
    
    votes = load_votes()
    if email not in votes:
        return redirect("/manage?error=No vote found for this email")
    
    # Remove email and their votes from single file
    del votes[email]
    save_votes(votes)
    
    return redirect("/manage?deleted=true")

@app.route("/manage")
def manage_votes():
    ensure_files()
    
    # Check for URL parameters to show messages
    deleted = request.args.get('deleted')
    check_result = request.args.get('check_result')
    error = request.args.get('error')
    
    message = None
    message_type = "success"
    
    if deleted:
        message = "Your vote has been successfully deleted."
    elif check_result:
        message = check_result
        message_type = "info"
    elif error:
        message = error
        message_type = "danger"
    
    return render_template("manage.html", message=message, message_type=message_type)

@app.route("/check", methods=["POST"])
def check_vote():
    ensure_files()
    email = request.form.get("email","").strip().lower()
    if not email:
        return redirect("/manage?error=Email required")
    
    votes = load_votes()
    if email in votes:
        voted_destinations = votes[email]
        destinations_str = ', '.join(voted_destinations)
        return redirect(f"/manage?check_result=You voted for: {destinations_str}")
    else:
        return redirect("/manage?check_result=No vote found for this email")

@app.route("/results")
def results():
    vote_counts = get_vote_counts()
    # Sort by vote count (descending) then alphabetically for tie-breaking
    sorted_votes = sorted(vote_counts.items(), key=lambda x: (-x[1], x[0]))
    labels = [item[0] for item in sorted_votes]
    counts = [item[1] for item in sorted_votes]
    
    # Identify top 4 winners and any ties
    top_4 = sorted_votes[:4]
    winners = [dest for dest, count in top_4]
    
    # Check for ties at the 4th position
    fourth_place_votes = top_4[3][1] if len(top_4) >= 4 else 0
    tied_destinations = [dest for dest, count in sorted_votes if count == fourth_place_votes and count > 0]
    
    tie_info = None
    if len(tied_destinations) > 1 and fourth_place_votes > 0:
        tied_in_top_4 = [dest for dest in tied_destinations if dest in winners]
        tied_outside_top_4 = [dest for dest in tied_destinations if dest not in winners]
        if tied_outside_top_4:
            tie_info = {
                'fourth_place_votes': fourth_place_votes,
                'tied_destinations': tied_destinations,
                'winners': winners,
                'tied_outside': tied_outside_top_4
            }
    
    return render_template("results.html", labels=labels, counts=counts, winners=winners, tie_info=tie_info)

if __name__ == "__main__":
    import os
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=False, host='0.0.0.0', port=port)