import json
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def solve_vehicle_routing(json_data):
    """
    ئەڤ فەنکشنە داتایێن JSON وەردگریت و کورتترین رێیا گەشتێ دیار دکەت ب رێکا Google OR-Tools.
    مەبەست ژێ کێمکرنا مەسافێ و دەرئەنجام کێمکرنا رێژەیا غازێن کاربۆنی یە.
    """
    # 1. وەرگرتن و شرۆڤەکرنا داتایێن بهێنە فرێکرن (Parsing JSON)
    data = json.loads(json_data)
    
    distance_matrix = data['distance_matrix']  # ماتریکسا دووراتیێ د ناڤبەرا خالان دا
    num_vehicles = data['num_vehicles']        # ژمارەیا ترۆمبێلێن بارهەلگر
    depot = data['depot']                      # خال دەستپێکێ یان کۆگەهـ (Depot)

    # 2. دروستکرنا راوێژکارێ رێڤەبرنا رێیان (Routing Index Manager)
    manager = pywrapcp.RoutingIndexManager(
        len(distance_matrix), 
        num_vehicles, 
        depot
    )

    # 3. دروستکرنا مۆدێلێ رێ رێکئێخستنێ (Routing Model)
    routing = pywrapcp.RoutingModel(manager)

    # 4. دروستکرنا فەنکشنا هەژمارکرنا دووراتیێ د ناڤبەرا دوو خالان دا
    def distance_callback(from_index, to_index):
        # گوهۆرینا ناڤ نیشانێن نافخۆیی بۆ ناڤ نیشانێن ماتریکسێ
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]

    # تۆمارکرنا فەنکشنا دووراتیێ د ناڤ سیستەمێ ئۆتۆمبێلێ دا
    transit_callback_index = routing.RegisterTransitCallback(distance_callback)

    # دیارکرنا بهایێ رێ ل سەر بنەمایێ دووراتیێ (کێمکرنا دووراتیێ = کێمکرنا کاربۆنی)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # 5. زێدەکرنا مەرجێ دووراتیێ (Distance Dimension) بۆ هندێ چ ترۆمبێل ژ رادەیەکێ دیارکری زێدەتر نەچیت
    dimension_name = 'Distance'
    routing.AddDistanceDimension(
        transit_callback_index,
        0,     # نەبوونا چو پاشکەفتنان (Slack)
        3000,  # زۆرترین مەسافە کو ترۆمبێلەک دشێت ببڕیت (بۆ نموونە ٣٠٠٠ کیلۆمەتر)
        True,  # دەستپێکرنا ژمارەکەرێ ژ سفرێ
        dimension_name
    )
    distance_dimension = routing.GetDimensionOrDie(dimension_name)
    distance_dimension.SetGlobalSpanCostCoefficient(100) # هاوسەنگکرنا رێیان د ناڤبەرا هەمی ترۆمبێلان دا

    # 6. دیارکرنا رێسایێن گەڕیانێ یێن دەستپێکێ (Search Parameters)
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )

    # 7. دەستپێکرنا چارەسەرکەرێ (Solving the Problem)
    solution = routing.SolveWithParameters(search_parameters)

    # 8. کۆمکرن و رێکخستنا دەرئەنجامان بۆ سەر شێوازێ JSON
    if solution:
        results = {
            "status": "Success",
            "total_distance": 0,
            "routes": []
        }
        
        total_dist = 0
        for vehicle_id in range(num_vehicles):
            index = routing.Start(vehicle_id)
            route = []
            route_dist = 0
            
            while not routing.IsEnd(index):
                node = manager.IndexToNode(index)
                route.append(node)
                previous_index = index
                index = solution.Value(routing.NextVar(index))
                route_dist += routing.GetArcCostForVehicle(previous_index, index, vehicle_id)
                
            route.append(manager.IndexToNode(index))
            results["routes"].append({
                "vehicle": vehicle_id,
                "path": route,
                "distance": route_dist
            })
            total_dist += route_dist
            
        results["total_distance"] = total_dist
        return json.dumps(results, indent=4)
    else:
        return json.dumps({"status": "Failed", "message": "چو چارەسەری نەهاتنە دیتن."})

# --- نموونەیا بکارئینانێ (Example Usage) ---
if __name__ == '__main__':
    # نموونەیا داتایەکا لۆجستیکی یا کاربۆن-سادە
    # ماتریکسا دووراتیێ (ب کیلۆمەتران) د ناڤبەرا ٤ وێستگەهان دا
    sample_payload = {
        "distance_matrix": [
            [0, 50, 80, 40],   # خال دەستپێکێ (Depot)
            [50, 0, 30, 60],   # وێستگەها ١
            [80, 30, 0, 70],   # وێستگەها ٢
            [40, 60, 70, 0]    # وێستگەها ٣
        ],
        "num_vehicles": 2,     # ٢ ترۆمبێلێن کارەبایی یان بارهەلگر یێن دۆستێن ژینگەهێ
        "depot": 0             # دەستپێکرن ژ خال سفڕ
    }
    
    json_input = json.dumps(sample_payload)
    print("--- دەستپێکرنا گەڕیانێ و هەژمارکرنێ د سیستەمێ EcoFlow دا ---")
    output_json = solve_vehicle_routing(json_input)
    print(output_json)
