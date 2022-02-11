use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::{update, query, init};
use ic_cdk::storage;

#[derive(CandidType, Deserialize)]
struct PutMetaInfo{
    pub name: String,
    pub description: String,
    pub chunk_num: usize,
}

#[derive(CandidType, Deserialize)]
struct MetaInfo{
    pub name: String,
    pub description: String,
    pub chunk_num: usize,
    pub version: usize,
    pub owner: Principal,
}

impl Default for MetaInfo{
    fn default() -> Self { 
        MetaInfo{
            name: String::new(),
            description: String::new(),
            chunk_num: 0,
            version: CANISTER_VERSION,
            owner: Principal::anonymous(),
        }
     }
}

#[derive(CandidType, Deserialize)]
enum PutMetaInfoResponse{
    #[serde(rename = "success")]
    Success,

    #[serde(rename = "missing_rights")]
    MissingRights,
}

#[derive(CandidType, Deserialize)]
enum PutChunkResponse{
    #[serde(rename = "success")]
    Success,

    #[serde(rename = "missing_rights")]
    MissingRights,

    #[serde(rename = "out_of_bounds")]
    OutOfBounds
}

#[derive(CandidType, Deserialize)]
enum ChangeOwnerResponse{
    #[serde(rename = "success")]
    Success,

    #[serde(rename = "missing_rights")]
    MissingRights,
}

const CANISTER_VERSION: usize = 1usize;

#[init]
pub async fn init(owner: Principal){
    *storage::get_mut::<MetaInfo>() = MetaInfo{
        name: String::new(),
        description: String::new(),
        chunk_num: 0,
        version: CANISTER_VERSION,
        owner,
    };
}
