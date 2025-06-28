import {IPaginationQuery} from "./pagination";

export interface CreateTourBody {
    name: string;
    description: string;
    price: number;
    available_spots: number;
    start_date: string;
    end_date: string;
    category_id: number;
    destination_id: number;
}

export interface UpdateTourBody extends CreateTourBody {}

export interface TourParams {
    id: number;
}

export interface GetFilteredToursQuery extends IPaginationQuery {
    category_id?: number;
    destination_id?: number;
    search?: string;
}

export interface GetTourByIdParams {
    id: number;
}

export interface GetTourByIdQuery {
    user_id?: number;
}
