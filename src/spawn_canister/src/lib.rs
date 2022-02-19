use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::{update};
use ic_cdk::api::call;

#[derive(CandidType, Deserialize)]
pub enum CreateCanisterResponse{
    #[serde(rename = "created")]
    Created(Principal),

    #[serde(rename = "insufficient_funds")]
    InsufficientFunds,
}

#[derive(CandidType, Deserialize)]
pub struct CreateCanisterResult {
    pub canister_id: Principal,
}

static VIDEO_CANISTER_CODE: &[u8;  include_bytes!("../../../target/wasm32-unknown-unknown/release/video_canister_opt.wasm").len()] = include_bytes!("../../../target/wasm32-unknown-unknown/release/video_canister_opt.wasm");

#[update]
pub async fn create_new_canister() -> CreateCanisterResponse{
    let manage_princ = Principal::management_canister();

    let response: Result<(CreateCanisterResult, ), _> = call::call(manage_princ, "create_canister", ()).await;

    match response{
        Ok(res) => {
            return CreateCanisterResponse::Created(res.0.canister_id)
        }
        Err(_) => {
            unimplemented!();
        }
    }

}
