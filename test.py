import json
import shapefile

def load_us_shapefile():
    # Read the JSON data
    with open('us.json', 'r') as file:
        data = json.load(file)

    # Create a new shapefile instance
    sf = shapefile.Writer()

    # Add the fields to the shapefile
    sf.fields = [('GEO_ID', 'C'), ('STATE', 'C'), ('NAME', 'C'), ('LSAD', 'C'), ('CENSUSAREA', 'F')]

    # Add the geometry and attributes for each feature
    for feature in data['features']:
        geometry = feature['geometry']
        properties = feature['properties']

        # Convert the coordinates to a shapefile-compatible format
        coordinates = []
        for polygon in geometry['coordinates']:
            if geometry['type'] == 'Polygon':
                coordinates.append(polygon)
            elif geometry['type'] == 'MultiPolygon':
                coordinates.extend(polygon)

        # Create the shape and record for the feature
        if coordinates:
            sf.poly(parts=coordinates)
            sf.record(*properties.values())

    # Save the shapefile
    sf.save('us_shapefile')

# Call the function to load the shapefile
load_us_shapefile()
