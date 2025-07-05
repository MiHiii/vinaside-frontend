import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { IListing, IQueryListing, ListingByIdResponse, PaginationMeta } from "../../types/listing";
import { api } from "@/services/api";

export const fetchListings = createAsyncThunk<
  { listings: IListing[]; meta: PaginationMeta },
  IQueryListing
>("listing/fetchListings", async (queryParams) => {
  const response = await api.get("/listings", { params: queryParams });

  return {
    listings: response.data.data.listings,
    meta: response.data.data.meta,
  };
});

export const fetchListingById = createAsyncThunk<IListing, string>(
  "listing/fetchListingById",
  async (id) => {
    const response = await api.get<ListingByIdResponse>(`/listings/${id}`);
    console.log("Fetched listing by ID:", response.data.data);

    return response.data.data;
  }
);

// Redux state interface
interface ListingState {
  listings: IListing[];
  meta: PaginationMeta | null;
  selectedListing: IListing | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ListingState = {
  listings: [],
  meta: null,
  selectedListing: null,
  loading: false,
  error: null,
};

const listingSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {
    clearSelectedListing(state) {
      state.selectedListing = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchListings.fulfilled,
        (
          state,
          action: PayloadAction<{ listings: IListing[]; meta: PaginationMeta }>
        ) => {
          state.loading = false;
          state.listings = action.payload.listings;
          state.meta = action.payload.meta;
        }
      )
      .addCase(fetchListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch listings";
      })

      .addCase(fetchListingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchListingById.fulfilled,
        (state, action: PayloadAction<IListing>) => {
          state.loading = false;
          state.selectedListing = action.payload;
        }
      )
      .addCase(fetchListingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch listing";
      });
  },
});

export const { clearSelectedListing } = listingSlice.actions;
export default listingSlice.reducer;
