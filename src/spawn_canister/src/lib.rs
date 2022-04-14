use ic_cdk::export::candid::{CandidType, Deserialize, Principal, Encode};
use ic_cdk_macros::{update};
use ic_cdk::api::call;

#[derive(CandidType, Deserialize)]
pub enum CreateCanisterResponse{
    #[serde(rename = "created")]
    Created(Principal),

    #[serde(rename = "insufficient_funds")]
    InsufficientFunds,

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

#[derive(CandidType, Deserialize)]
pub enum InstallMode {
    #[serde(rename = "install")]
    Install,
    #[serde(rename = "reinstall")]
    Reinstall,
    #[serde(rename = "upgrade")]
    Upgrade,
}

#[derive(CandidType, Deserialize)]
pub struct InstallCodeArg {
    pub mode: InstallMode,
    pub canister_id: Principal,
    pub wasm_module: Vec<u8>,
    pub arg : Vec<u8>,
}

#[derive(CandidType, Deserialize)]
pub struct CanisterSettings{
    controllers: Option<Vec<Principal>>,
    compute_allocation: Option<candid::Nat>,
    memory_allocation: Option<candid::Nat>,
    freezing_threshold: Option<candid::Nat>,
}

#[derive(CandidType, Deserialize)]
pub struct UpdateSettingsArg{
    canister_id: Principal,
    settings: CanisterSettings,
}

static VIDEO_CANISTER_CODE: &[u8;  include_bytes!("../../../target/wasm32-unknown-unknown/release/video_canister_opt.wasm").len()] = include_bytes!("../../../target/wasm32-unknown-unknown/release/video_canister_opt.wasm");

const MIN_CANISTER_CYCLES_REQUIRED: u64 = 200_000_000_000; //TODO rough guess, calculate correct costs

#[update]
pub async fn create_new_canister(owner: Principal) -> CreateCanisterResponse{

    let owner_wallet = ic_cdk::api::caller(); //call early before any callbacks from calling other canisters
    let available_cycles = call::msg_cycles_available();  

    if available_cycles < MIN_CANISTER_CYCLES_REQUIRED{
        return CreateCanisterResponse::InsufficientFunds;
    } else {
        call::msg_cycles_accept(available_cycles);
    }

    let canister_princ = match create_canister_on_network().await{
        Ok(new_princ) => new_princ,
        Err(_err_str) => {
            return CreateCanisterResponse::CanisterCreationError;
        }
    };

    if let Err(_err_str) = install_video_canister(canister_princ.clone(), &owner).await{
        return CreateCanisterResponse::CanisterInstallationError;
    };

    if let Err(_err_str) = change_controller_to_owner(canister_princ.clone(), &owner_wallet).await{
        return CreateCanisterResponse::ChangeControllerError;
    }

    return CreateCanisterResponse::Created(canister_princ);
}

async fn create_canister_on_network() -> Result<Principal, String>{
    let manage_princ = Principal::management_canister();

    let response: Result<(CreateCanisterResult, ), _> = call::call(manage_princ, "create_canister", ()).await;

    match response{
        Ok(res) => {
            return Ok(res.0.canister_id);
        }
        Err(err) => {
            return Err(err.1);
        }
    }
}

async fn install_video_canister(canister: Principal, owner: &Principal) -> Result<(), String>{
    let manage_princ = Principal::management_canister();

    let encoded_arg = Encode!(owner).expect("Could not encode owner principal");

    let install_arg = InstallCodeArg {
        mode: InstallMode::Install,
        canister_id: canister,
        wasm_module: VIDEO_CANISTER_CODE.to_vec(),
        arg: encoded_arg,
    };

    let response: Result<(), _> = call::call( manage_princ, "install_code", (install_arg,)).await;

    match response{
        Ok(_) => return Ok(()),
        Err(err) => {
            return Err(err.1)
        }
    }
}

async fn change_controller_to_owner(canister: Principal, owner: &Principal) -> Result<(), String> {

    let manage_princ = Principal::management_canister();

    let settings_arg = UpdateSettingsArg{
        canister_id: canister,
        settings: CanisterSettings{
            controllers: Some(vec![*owner]),
            compute_allocation: None,
            memory_allocation: None,
            freezing_threshold: None,
        }
    };

    let response: Result<(), _> = call::call( manage_princ, "update_settings", (settings_arg,)).await;

    match response{
        Ok(_) => return Ok(()),
        Err(err) => {
            return Err(err.1)
        }
    }
}
