import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer
from transformers import pipeline
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

def clean(txt):
    txt = txt.lower()
    txt = re.sub(r"[^\w\s]", "", txt)
    txt = re.sub(r"\d+", "", txt)
    return txt.strip()

sw = set(stopwords.words("english"))
lem = WordNetLemmatizer()


def process(txt):
    wrd = nltk.word_tokenize(txt)
    flt = [w for w in wrd if w not in sw]
    lemz = [lem.lemmatize(w) for w in flt]
    return lemz


def key(txt, top=5):
    vec = TfidfVectorizer(stop_words='english')
    mat = vec.fit_transform([txt])
    scs = zip(vec.get_feature_names_out(), mat.toarray()[0])
    srt = sorted(scs, key=lambda x: x[1], reverse=True)
    return [w for w, _ in srt[:top]]

snt = SentimentIntensityAnalyzer()

def sent(txt):
    sc = snt.polarity_scores(txt)
    if sc['compound'] >= 0.5:
        return "positive"
    elif sc['compound'] <= -0.5:
        return "negative"
    else:
        return "neutral"
emo_pipe = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=1)

def emo(txt):
    res = emo_pipe(txt)
    return res[0][0]['label']
def ana(txt):
    txt = clean(txt)
    tok = process(txt)
    kw = key(txt)
    se = sent(txt)
    emt = emo(txt)
    return {
        "tokens": tok,
        "keywords": kw,
        "sentiment": se,
        "emotion": emt
    }   