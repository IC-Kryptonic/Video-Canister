use ic_cdk::export::candid::{CandidType, Deserialize, Principal};

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

