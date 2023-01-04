export interface CoordinateLL {
    lat: number;
    lng: number;
    points?: string;
    points_lat_lng?: any[];
    overview_points?: any[];
}

export interface Distance {
    value: number;
}

export interface Duration {
    value: number;
}

export interface Step {
    distance: Distance;
    duration: Duration;
    start_location: CoordinateLL;
    end_location: CoordinateLL;
    start_inside_place: string;
    end_inside_place: string;
    html_instructions: string;
    polyline: CoordinateLL;
    travel_mode: string;
    start_inside_floor: string;
    end_inside_floor: string;
    auto_generated_message: boolean;
    elevator_step: boolean;
    maneuver: string;
    icon: string;
}

export interface StepDTO extends Partial<Step> { }

export interface CoordinateStep { }