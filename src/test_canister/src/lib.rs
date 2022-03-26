use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::{update};
use ic_cdk::api::call;

#[derive(CandidType, Deserialize)]
pub enum CreateCanisterResponse{
    #[serde(rename = "created")]
    Created(Principal),

    #[serde(rename = "insufficient_funds")]
    InsufficientFunds(u64),

    #[serde(rename = "unknown_error")]
    UnknownError(String),

    #[serde(rename = "canister_creation_error")]
    CanisterCreationError,

    #[serde(rename = "canister_installation_error")]
    CanisterInstallationError,

    #[serde(rename = "change_controller_error")]
    ChangeControllerError,
}

#[derive(CandidType, Deserialize)]
pub struct CreateCanisterResult {
    pub canister_id: Principal,
}

#[update]
pub async fn test_create_new_canister(_number_of_cycles: u64, spawn_canister: String) ->  CreateCanisterResponse{
    let princ =  Principal::from_text(spawn_canister).unwrap();
    let call_result : Result<(CreateCanisterResponse, ), _> = call::call(princ, "create_new_canister", ()).await;
    match call_result{
        Ok(res) => {
            return res.0;
        }
        Err(err) => {
            return CreateCanisterResponse::UnknownError(err.1);
        }
    }
}