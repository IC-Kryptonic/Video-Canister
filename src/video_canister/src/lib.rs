use ic_cdk::export::candid::{CandidType, Deserialize, Principal,};
use ic_cdk_macros::{update, query, init, pre_upgrade, post_upgrade};
use ic_cdk::storage;

#[derive(CandidType, Deserialize)]
pub struct PutMetaInfo{
    pub name: String,
    pub description: String,
    pub chunk_num: usize,
}

#[derive(CandidType, Deserialize)]
pub struct MetaInfo{
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
pub enum PutMetaInfoResponse{
    #[serde(rename = "success")]
    Success,

    #[serde(rename = "missing_rights")]
    MissingRights,
}

#[derive(CandidType, Deserialize)]
pub enum PutChunkResponse{
    #[serde(rename = "success")]
    Success,

    #[serde(rename = "missing_rights")]
    MissingRights,

    #[serde(rename = "out_of_bounds")]
    OutOfBounds
}

#[derive(CandidType, Deserialize)]
pub enum ChangeOwnerResponse{
    #[serde(rename = "success")]
    Success,

    #[serde(rename = "missing_rights")]
    MissingRights,
}

type Chunk = Vec<u8>;
type Chunks = Vec<Chunk>;

const CANISTER_VERSION: usize = 0usize;

#[init]
pub async fn init(owner: Principal){
    storage::get_mut::<MetaInfo>().owner = owner;
}

#[update]
pub async fn put_meta_info(new_meta_info: PutMetaInfo) -> PutMetaInfoResponse{
    let mut old_meta_info = storage::get_mut::<MetaInfo>();
    if old_meta_info.owner != ic_cdk::caller() {
        return PutMetaInfoResponse::MissingRights;
    } else {
        old_meta_info.name = new_meta_info.name;
        old_meta_info.description = new_meta_info.description;

        //Resize array
        if old_meta_info.chunk_num != new_meta_info.chunk_num{
            let _old_chunks = std::mem::replace(storage::get_mut::<Chunks>(), vec![Vec::new(); new_meta_info.chunk_num]);
            old_meta_info.chunk_num = new_meta_info.chunk_num;
        }

        return PutMetaInfoResponse::Success;
    }
}

#[update]
pub async fn put_chunk(chunk_num: usize, chunk: Chunk) -> PutChunkResponse{
    let owner = (*storage::get::<MetaInfo>()).owner;
    if owner != ic_cdk::caller() {
        return PutChunkResponse::MissingRights;
    } else {
        let chunks = storage::get_mut::<Chunks>();

        if chunk_num >= chunks.len(){
            return PutChunkResponse::OutOfBounds;
        }
        
        chunks[chunk_num] = chunk;
        return PutChunkResponse::Success;
    }
}

#[update]
pub async fn change_owner(new_owner: Principal) -> ChangeOwnerResponse{
    let old_owner = &mut storage::get_mut::<MetaInfo>().owner;

    if *old_owner != ic_cdk::caller() {
        return ChangeOwnerResponse::MissingRights;
    } else { 
        *old_owner = new_owner;
        return ChangeOwnerResponse::Success;
    }
}

#[query]
pub async fn get_meta_info() -> &'static MetaInfo{
    return storage::get::<MetaInfo>();
}

#[query]
pub async fn get_chunk(chunk_num: usize) -> Option<&'static Chunk>{
    return storage::get::<Chunks>().get(chunk_num);
}

#[pre_upgrade]
fn pre_upgrade() {
    let pair = (storage::get::<MetaInfo>(), storage::get::<Chunks>());
    storage::stable_save((pair,)).unwrap();
}

#[post_upgrade]
fn post_upgrade() {
    let ((old_meta_info, chunks),): ((MetaInfo, Chunks),) = storage::stable_restore().unwrap();

    let meta_info = storage::get_mut::<MetaInfo>();
    meta_info.chunk_num = old_meta_info.chunk_num;
    meta_info.description = old_meta_info.description;
    meta_info.owner = old_meta_info.owner;
    meta_info.name = old_meta_info.name;

    let _ = std::mem::replace(storage::get_mut::<Chunks>(), chunks);
}