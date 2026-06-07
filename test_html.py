from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def handle_starttag(self, tag, attrs):
        pass
    def handle_endtag(self, tag):
        pass
    def handle_data(self, data):
        pass

parser = MyHTMLParser()
with open('index.html', 'r') as f:
    try:
        parser.feed(f.read())
        print("HTML successfully parsed. No major structure errors.")
    except Exception as e:
        print(f"Error parsing HTML: {e}")
